const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

// GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const pending = await Complaint.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Assigned'] } });
    const highPriority = await Complaint.countDocuments({ priority: 'High', status: { $ne: 'Resolved' } });

    res.status(200).json({
      success: true,
      summary: {
        total,
        resolved,
        inProgress,
        pending,
        highPriority,
        resolutionPercentage: total > 0 ? Math.round((resolved / total) * 100) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/categories
const getCategoryAnalytics = async (req, res, next) => {
  try {
    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categoryBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/hotspots
const getHotspots = async (req, res, next) => {
  try {
    const { category, status, priority, days } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (days && days !== 'all') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - parseInt(days));
      filter.createdAt = { $gte: pastDate };
    }

    // Fetch individual complaint map points
    const complaints = await Complaint.find(filter)
      .select('complaintId title description category status priority location createdAt imageUrl')
      .populate('citizenId', 'name')
      .lean();

    // Geospatial Grid Clustering for Hotspots (~0.005 deg is ~500m)
    const gridSize = 0.006;
    const clusterMap = new Map();

    complaints.forEach((c) => {
      if (c.location && Array.isArray(c.location.coordinates) && c.location.coordinates.length === 2) {
        const lng = c.location.coordinates[0];
        const lat = c.location.coordinates[1];

        // Grid bucket key
        const gridX = Math.round(lng / gridSize);
        const gridY = Math.round(lat / gridSize);
        const key = `${gridX}_${gridY}`;

        if (!clusterMap.has(key)) {
          clusterMap.set(key, {
            centerLng: lng,
            centerLat: lat,
            count: 0,
            highPriorityCount: 0,
            categories: {},
            statuses: {},
            complaintIds: [],
            landmarks: new Set(),
            points: []
          });
        }

        const cluster = clusterMap.get(key);
        cluster.count += 1;
        if (c.priority === 'High') cluster.highPriorityCount += 1;
        cluster.categories[c.category] = (cluster.categories[c.category] || 0) + 1;
        cluster.statuses[c.status] = (cluster.statuses[c.status] || 0) + 1;
        cluster.complaintIds.push(c.complaintId);
        if (c.location.landmark) cluster.landmarks.add(c.location.landmark);
        if (c.location.address) cluster.landmarks.add(c.location.address);
        cluster.points.push({
          id: c._id,
          complaintId: c.complaintId,
          title: c.title,
          category: c.category,
          status: c.status,
          priority: c.priority,
          coordinates: [lng, lat]
        });
      }
    });

    // Format clusters into hotspots
    const hotspots = [];
    clusterMap.forEach((data, key) => {
      // Find top category in cluster
      let topCategory = 'General Civic';
      let maxCatCount = 0;
      Object.entries(data.categories).forEach(([cat, cnt]) => {
        if (cnt > maxCatCount) {
          maxCatCount = cnt;
          topCategory = cat;
        }
      });

      // Cluster intensity level: High (>=4 complaints), Medium (2-3), Low (1)
      let severityLevel = 'Low';
      if (data.count >= 4 || data.highPriorityCount >= 2) severityLevel = 'High';
      else if (data.count >= 2) severityLevel = 'Medium';

      const landmarkArr = Array.from(data.landmarks);
      const zoneName = landmarkArr.length > 0 ? landmarkArr[0] : `Sector Area [${data.centerLat.toFixed(3)}, ${data.centerLng.toFixed(3)}]`;

      hotspots.push({
        id: key,
        center: [data.centerLat, data.centerLng],
        count: data.count,
        highPriorityCount: data.highPriorityCount,
        severityLevel,
        zoneName,
        topCategory,
        categoryBreakdown: data.categories,
        statusBreakdown: data.statuses,
        complaints: data.points
      });
    });

    // Sort hotspots by intensity
    hotspots.sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      totalComplaints: complaints.length,
      hotspotCount: hotspots.length,
      hotspots,
      complaints
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryAnalytics,
  getHotspots
};
