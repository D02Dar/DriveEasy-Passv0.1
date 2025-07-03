const express = require('express');
const { executeQuery, findOne, findMany } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 获取所有驾校信息
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const isPartner = req.query.isPartner;

    let whereClause = '1=1';
    const queryParams = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR address LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (isPartner !== undefined) {
      whereClause += ' AND is_partner = ?';
      queryParams.push(isPartner === 'true' ? 1 : 0);
    }

    // 获取驾校总数
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total FROM driving_schools WHERE ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 获取驾校列表
    const schools = await executeQuery(`
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        phone,
        line_id as lineId,
        website_url as websiteUrl,
        description,
        is_partner as isPartner,
        logo_url as logoUrl,
        created_at as createdAt,
        updated_at as updatedAt
      FROM driving_schools
      WHERE ${whereClause}
      ORDER BY is_partner DESC, name ASC
      LIMIT ${limit} OFFSET ${offset}
    `, queryParams);

    res.json({
      success: true,
      data: {
        schools,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取驾校列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取驾校列表失败'
    });
  }
});

// 获取单个驾校详情
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const schoolId = parseInt(req.params.id);

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: '无效的驾校ID'
      });
    }

    // 获取驾校详情
    const schools = await executeQuery(`
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        phone,
        line_id as lineId,
        website_url as websiteUrl,
        description,
        is_partner as isPartner,
        logo_url as logoUrl,
        created_at as createdAt,
        updated_at as updatedAt
      FROM driving_schools
      WHERE id = ?
    `, [schoolId]);

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: '驾校不存在'
      });
    }

    const school = schools[0];

    res.json({
      success: true,
      data: school
    });

  } catch (error) {
    console.error('获取驾校详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取驾校详情失败'
    });
  }
});

// 根据位置获取附近的驾校
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: '缺少位置参数'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
      return res.status(400).json({
        success: false,
        message: '位置参数格式错误'
      });
    }

    // 使用 Haversine 公式计算距离
    const nearbySchools = await executeQuery(`
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        phone,
        line_id as lineId,
        website_url as websiteUrl,
        description,
        is_partner as isPartner,
        logo_url as logoUrl,
        (
          6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitude))
          )
        ) AS distance
      FROM driving_schools
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
      HAVING distance <= ?
      ORDER BY distance ASC
      LIMIT 50
    `, [latitude, longitude, latitude, searchRadius]);

    res.json({
      success: true,
      data: {
        schools: nearbySchools,
        searchCenter: {
          latitude,
          longitude
        },
        searchRadius
      }
    });

  } catch (error) {
    console.error('获取附近驾校失败:', error);
    res.status(500).json({
      success: false,
      message: '获取附近驾校失败'
    });
  }
});

// 获取合作驾校
router.get('/partners', optionalAuth, async (req, res) => {
  try {
    const partnerSchools = await executeQuery(`
      SELECT
        id,
        name,
        address,
        latitude,
        longitude,
        phone,
        line_id as lineId,
        website_url as websiteUrl,
        description,
        logo_url as logoUrl,
        created_at as createdAt
      FROM driving_schools
      WHERE is_partner = 1
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: partnerSchools
    });

  } catch (error) {
    console.error('获取合作驾校失败:', error);
    res.status(500).json({
      success: false,
      message: '获取合作驾校失败'
    });
  }
});

module.exports = router;
