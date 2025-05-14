const express = require('express');
const router = express.Router();
const {
    createSegment,
    getSegments,
    getSegment,
    previewSegment
} = require('../controllers/segmentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Segment:
 *       type: object
 *       required:
 *         - name
 *         - rules
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the segment
 *         description:
 *           type: string
 *           description: Description of the segment
 *         rules:
 *           type: object
 *           properties:
 *             operator:
 *               type: string
 *               enum: [AND, OR]
 *             conditions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   operator:
 *                     type: string
 *                     enum: [equals, not_equals, greater_than, less_than, contains, not_contains, in, not_in]
 *                   value:
 *                     type: string
 */

/**
 * @swagger
 * /api/segments:
 *   get:
 *     summary: Get all segments
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: List of segments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segment'
 *   post:
 *     summary: Create a new segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       201:
 *         description: Segment created successfully
 *       400:
 *         description: Invalid input data
 */
router.get('/', getSegments);
router.post('/', createSegment);

/**
 * @swagger
 * /api/segments/{id}:
 *   get:
 *     summary: Get a segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Segment'
 *       404:
 *         description: Segment not found
 */
router.get('/:id', getSegment);

/**
 * @swagger
 * /api/segments/preview:
 *   post:
 *     summary: Preview segment size
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *                 properties:
 *                   operator:
 *                     type: string
 *                     enum: [AND, OR]
 *                   conditions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         field:
 *                           type: string
 *                         operator:
 *                           type: string
 *                         value:
 *                           type: string
 *     responses:
 *       200:
 *         description: Segment preview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     audienceSize:
 *                       type: integer
 */
router.post('/preview', previewSegment);

module.exports = router; 