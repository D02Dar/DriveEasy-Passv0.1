const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { executeQuery, insertOne, updateOne, deleteOne, findOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const accidentPath = path.join(uploadPath, 'accidents');
    
    // 确保目录存在
    if (!fs.existsSync(accidentPath)) {
      fs.mkdirSync(accidentPath, { recursive: true });
    }
    
    cb(null, accidentPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 获取用户的事故报告列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';

    let whereClause = 'user_id = ?';
    const queryParams = [req.user.id];

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    // 获取事故报告总数
    const countResult = await executeQuery(
      `SELECT COUNT(*) as total FROM accident_reports WHERE ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 获取事故报告列表
    const reports = await executeQuery(`
      SELECT
        id,
        accident_time as accidentTime,
        accident_location as accidentLocation,
        description,
        other_party_info as otherPartyInfo,
        pdf_url as pdfUrl,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM accident_reports
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `, queryParams);

    // 为每个报告获取照片数量
    for (const report of reports) {
      const photoCount = await executeQuery(`
        SELECT COUNT(*) as total
        FROM accident_report_photos
        WHERE accident_report_id = ?
      `, [report.id]);
      
      report.photoCount = photoCount[0].total;
    }

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取事故报告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取事故报告列表失败'
    });
  }
});

// 获取单个事故报告详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: '无效的报告ID'
      });
    }

    // 获取事故报告
    const reports = await executeQuery(`
      SELECT
        id,
        accident_time as accidentTime,
        accident_location as accidentLocation,
        description,
        other_party_info as otherPartyInfo,
        pdf_url as pdfUrl,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM accident_reports
      WHERE id = ? AND user_id = ?
    `, [reportId, req.user.id]);

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: '事故报告不存在'
      });
    }

    const report = reports[0];

    // 获取照片列表
    const photos = await executeQuery(`
      SELECT
        id,
        image_url as imageUrl,
        photo_type as photoType,
        caption,
        uploaded_at as uploadedAt,
        sort_order as sortOrder
      FROM accident_report_photos
      WHERE accident_report_id = ?
      ORDER BY sort_order ASC, uploaded_at ASC
    `, [reportId]);

    report.photos = photos;

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('获取事故报告详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取事故报告详情失败'
    });
  }
});

// 创建事故报告
router.post('/', authenticateToken, [
  body('accidentTime').isISO8601().withMessage('事故时间格式无效'),
  body('accidentLocation').optional().isString().withMessage('事故地点必须是字符串'),
  body('description').optional().isString().withMessage('描述必须是字符串'),
  body('otherPartyInfo').optional().isString().withMessage('对方信息必须是字符串')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const {
      accidentTime,
      accidentLocation,
      description,
      otherPartyInfo
    } = req.body;

    // 创建事故报告
    const reportId = await insertOne('accident_reports', {
      user_id: req.user.id,
      accident_time: new Date(accidentTime),
      accident_location: accidentLocation || null,
      description: description || null,
      other_party_info: otherPartyInfo || null,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: { reportId },
      message: '事故报告创建成功'
    });

  } catch (error) {
    console.error('创建事故报告失败:', error);
    res.status(500).json({
      success: false,
      message: '创建事故报告失败'
    });
  }
});

// 更新事故报告
router.put('/:id', authenticateToken, [
  body('accidentTime').optional().isISO8601().withMessage('事故时间格式无效'),
  body('accidentLocation').optional().isString().withMessage('事故地点必须是字符串'),
  body('description').optional().isString().withMessage('描述必须是字符串'),
  body('otherPartyInfo').optional().isString().withMessage('对方信息必须是字符串'),
  body('status').optional().isIn(['draft', 'submitted', 'archived']).withMessage('状态值无效')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const reportId = parseInt(req.params.id);
    const {
      accidentTime,
      accidentLocation,
      description,
      otherPartyInfo,
      status
    } = req.body;

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: '无效的报告ID'
      });
    }

    // 检查报告是否存在且属于当前用户
    const report = await findOne('accident_reports', {
      id: reportId,
      user_id: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '事故报告不存在'
      });
    }

    // 构建更新数据
    const updateData = {};
    if (accidentTime !== undefined) updateData.accident_time = new Date(accidentTime);
    if (accidentLocation !== undefined) updateData.accident_location = accidentLocation;
    if (description !== undefined) updateData.description = description;
    if (otherPartyInfo !== undefined) updateData.other_party_info = otherPartyInfo;
    if (status !== undefined) updateData.status = status;

    // 更新事故报告
    await updateOne('accident_reports', updateData, { id: reportId });

    res.json({
      success: true,
      message: '事故报告更新成功'
    });

  } catch (error) {
    console.error('更新事故报告失败:', error);
    res.status(500).json({
      success: false,
      message: '更新事故报告失败'
    });
  }
});

// 删除事故报告
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: '无效的报告ID'
      });
    }

    // 检查报告是否存在且属于当前用户
    const report = await findOne('accident_reports', {
      id: reportId,
      user_id: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '事故报告不存在'
      });
    }

    // 获取相关照片文件路径
    const photos = await executeQuery(`
      SELECT image_url
      FROM accident_report_photos
      WHERE accident_report_id = ?
    `, [reportId]);

    // 删除事故报告（级联删除照片记录）
    await deleteOne('accident_reports', { id: reportId });

    // 删除物理文件
    photos.forEach(photo => {
      const filePath = path.join(process.env.UPLOAD_PATH || './uploads', photo.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    res.json({
      success: true,
      message: '事故报告删除成功'
    });

  } catch (error) {
    console.error('删除事故报告失败:', error);
    res.status(500).json({
      success: false,
      message: '删除事故报告失败'
    });
  }
});

// 上传事故照片
router.post('/:id/photos', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      return res.status(400).json({
        success: false,
        message: '无效的报告ID'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    // 检查报告是否存在且属于当前用户
    const report = await findOne('accident_reports', {
      id: reportId,
      user_id: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '事故报告不存在'
      });
    }

    const { photoType = 'other', caption = '' } = req.body;

    // 保存照片记录
    const photoId = await insertOne('accident_report_photos', {
      accident_report_id: reportId,
      image_url: `/uploads/accidents/${req.file.filename}`,
      photo_type: photoType,
      caption: caption,
      sort_order: 0
    });

    res.status(201).json({
      success: true,
      data: {
        photoId,
        imageUrl: `/uploads/accidents/${req.file.filename}`,
        photoType,
        caption
      },
      message: '照片上传成功'
    });

  } catch (error) {
    console.error('上传照片失败:', error);
    res.status(500).json({
      success: false,
      message: '上传照片失败'
    });
  }
});

// 删除事故照片
router.delete('/:reportId/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const reportId = parseInt(req.params.reportId);
    const photoId = parseInt(req.params.photoId);

    if (isNaN(reportId) || isNaN(photoId)) {
      return res.status(400).json({
        success: false,
        message: '无效的ID参数'
      });
    }

    // 检查报告是否存在且属于当前用户
    const report = await findOne('accident_reports', {
      id: reportId,
      user_id: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '事故报告不存在'
      });
    }

    // 获取照片信息
    const photo = await findOne('accident_report_photos', {
      id: photoId,
      accident_report_id: reportId
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 删除照片记录
    await deleteOne('accident_report_photos', { id: photoId });

    // 删除物理文件
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', photo.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: '照片删除成功'
    });

  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({
      success: false,
      message: '删除照片失败'
    });
  }
});

module.exports = router;
