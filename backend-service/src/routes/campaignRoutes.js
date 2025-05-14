const express = require('express');
const router = express.Router();
const {
    createCampaign,
    getCampaigns,
    getCampaign,
    getCampaignLogs,
    updateCampaignStatus,
    updateCampaignStats,
    handleDeliveryReceipts,
    getCampaignStats
} = require('../controllers/campaignController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       required:
 *         - name
 *         - segmentId
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the campaign
 *         segmentId:
 *           type: string
 *           description: ID of the segment
 *         message:
 *           type: string
 *           description: Message template with {name} placeholder
 *         status:
 *           type: string
 *           enum: [DRAFT, PROCESSING, COMPLETED, ERROR]
 *           description: Current status of the campaign
 *         audienceSize:
 *           type: number
 *           description: Number of customers in the segment
 *         sentCount:
 *           type: number
 *           description: Number of messages successfully sent
 *         failedCount:
 *           type: number
 *           description: Number of messages failed to send
 */

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of campaigns
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
 *                     $ref: '#/components/schemas/Campaign'
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - segmentId
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               segmentId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid input data
 */
router.get('/', getCampaigns);
router.post('/', createCampaign);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', getCampaign);

/**
 * @swagger
 * /api/campaigns/{id}/logs:
 *   get:
 *     summary: Get communication logs for a specific campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Campaign id
 *     responses:
 *       200:
 *         description: List of communication logs
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
 *                     $ref: '#/components/schemas/CommunicationLog'
 *       404:
 *         description: Campaign not found
 */
router.get('/:id/logs', getCampaignLogs);

/**
 * @swagger
 * /api/campaigns/{id}/status:
 *   patch:
 *     summary: Update campaign status
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled, running, completed, failed]
 *     responses:
 *       200:
 *         description: Campaign status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Campaign not found
 */
router.patch('/:id/status', updateCampaignStatus);

/**
 * @swagger
 * /api/campaigns/{id}/stats:
 *   patch:
 *     summary: Update campaign statistics
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stats:
 *                 type: object
 *                 properties:
 *                   sent:
 *                     type: integer
 *                   failed:
 *                     type: integer
 *                   delivered:
 *                     type: integer
 *                   opened:
 *                     type: integer
 *                   clicked:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Campaign statistics updated
 *       400:
 *         description: Invalid statistics data
 *       404:
 *         description: Campaign not found
 */
router.patch('/:id/stats', updateCampaignStats);

/**
 * @swagger
 * /api/campaigns/delivery-receipts:
 *   post:
 *     summary: Handle delivery receipts from vendor API
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receipts
 *             properties:
 *               receipts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [SENT, FAILED]
 *                     logId:
 *                       type: string
 *                     campaignId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Receipts processed successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/delivery-receipts', handleDeliveryReceipts);

/**
 * @swagger
 * /api/campaigns/stats:
 *   get:
 *     summary: Get campaign statistics
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: Campaign statistics
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
 *                     totalCampaigns:
 *                       type: number
 *                     totalSent:
 *                       type: number
 *                     totalFailed:
 *                       type: number
 */
router.get('/stats', getCampaignStats);

module.exports = router; 