const Venue = require('../models/venue.model');
const Event = require('../models/event.model');


const venueController = {
  // Get all venues
  getAllVenues: async (req, res) => {
    try {
      const venues = await Venue.find().sort({ createdAt: -1 });
      
      res.status(200).json({ 
        status: 'success', 
        data: venues,
        count: venues.length
      });
    } catch (err) {
      console.error('Error fetching venues:', err);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch venues',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Create new venue
  createVenue: async (req, res) => {
    try {
      const { name, description, layoutType, rows, cols, aisleAfterCol, categories } = req.body;
      
      // Validate required fields
      if (!name || !rows || !cols) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Name, rows and cols are required fields'
        });
      }
      
      // Validate categories
      if (categories) {
        const totalCategoryRows = categories.reduce((sum, cat) => sum + (cat.rowCount || 0), 0);
        if (totalCategoryRows > rows) {
          return res.status(400).json({ 
            status: 'error',
            message: 'Total category rows exceed venue rows'
          });
        }
      }
      
      const unavailableSeats = req.body.unavailableSeats || [];
      const totalSeats = rows * cols;
      
      // Generate SVG
      const svgTemplate = generateSVG({
        rows,
        cols,
        aisleAfterCol,
        categories: categories || [],
        unavailableSeats
      });
      
      const venue = new Venue({
        name,
        description,
        layoutType,
        totalSeats,
        seatMap: {
          rows,
          cols,
          aisleAfterCol,
          categories: categories || [],
          unavailableSeats
        },
        svgTemplate
      });
      
      await venue.save();
      
      res.status(201).json({
        status: 'success',
        data: venue
      });
    } catch (err) {
      console.error('Error creating venue:', err);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to create venue',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Get single venue
  getVenue: async (req, res) => {
    try {
      const venue = await Venue.findById(req.params.id);
      
      if (!venue) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Venue not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        data: venue
      });
    } catch (err) {
      console.error('Error fetching venue:', err);
      
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid venue ID format'
        });
      }
      
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch venue',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Get venue with pricing from event
  getVenueWithPricing: async (req, res) => {
    try {
      const venue = await Venue.findById(req.params.venueId);
      if (!venue) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Venue not found' 
        });
      }
      
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Event not found' 
        });
      }
      
      // Map venue categories with event pricing
      const categoriesWithPricing = venue.seatMap.categories.map(cat => {
        const eventCategory = event.ticketTypes.find(ec => ec.name === cat.name);
        return {
          ...cat.toObject(),
          price: eventCategory ? eventCategory.price : 0
        };
      });
      
      const venueWithPricing = {
        ...venue.toObject(),
        seatMap: {
          ...venue.seatMap,
          categories: categoriesWithPricing
        }
      };
      
      res.status(200).json({
        status: 'success',
        data: venueWithPricing
      });
    } catch (err) {
      console.error('Error fetching venue with pricing:', err);
      
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid ID format'
        });
      }
      
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch venue with pricing',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Update venue
  updateVenue: async (req, res) => {
    try {
      const { unavailableSeats, name, description, layoutType } = req.body;
      
      const venue = await Venue.findById(req.params.id);
      if (!venue) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Venue not found' 
        });
      }
      
      // Update basic fields if provided
      if (name) venue.name = name;
      if (description) venue.description = description;
      if (layoutType) venue.layoutType = layoutType;
      
      // Update unavailable seats if provided
      if (unavailableSeats) {
        venue.seatMap.unavailableSeats = unavailableSeats;
      }
      
      // Regenerate SVG with updated data
      venue.svgTemplate = generateSVG({
        rows: venue.seatMap.rows,
        cols: venue.seatMap.cols,
        aisleAfterCol: venue.seatMap.aisleAfterCol,
        categories: venue.seatMap.categories,
        unavailableSeats: venue.seatMap.unavailableSeats
      });
      
      venue.updatedAt = new Date();
      await venue.save();
      
      res.status(200).json({
        status: 'success',
        data: venue
      });
    } catch (err) {
      console.error('Error updating venue:', err);
      
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid venue ID format'
        });
      }
      
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to update venue',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Delete venue
  deleteVenue: async (req, res) => {
    try {
      const deletedVenue = await Venue.findByIdAndDelete(req.params.id);
      
      if (!deletedVenue) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Venue not found' 
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Venue deleted successfully',
        data: {
          id: deletedVenue._id,
          name: deletedVenue.name
        }
      });
    } catch (err) {
      console.error('Error deleting venue:', err);
      
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid venue ID format'
        });
      }
      
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to delete venue',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
};

// Helper function to generate SVG (same as before)
function generateSVG({ rows, cols, aisleAfterCol, categories, unavailableSeats = [] }) {
  const seatWidth = 30;
  const seatHeight = 30;
  const spacing = 5;
  const stageHeight = 40;
  const aisleWidth = 40;
  
  // Calculate total SVG dimensions
  const svgWidth = cols * (seatWidth + spacing) + aisleWidth;
  const svgHeight = rows * (seatHeight + spacing) + stageHeight + 20;
  
  let svg = `<svg width="${svgWidth}" 
                height="${svgHeight}" 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 ${svgWidth} ${svgHeight}">`;
  
  // Add stage/performance area
  svg += `<rect x="${(svgWidth - cols * seatWidth) / 2}" y="10" 
          width="${cols * seatWidth}" height="${stageHeight}" 
          fill="#333" rx="3" />`;
  svg += `<text x="${svgWidth / 2}" y="${stageHeight/2 + 15}" 
          text-anchor="middle" fill="white" font-size="14" font-weight="bold">STAGE</text>`;
  
  // Calculate category row distribution
  let rowDistribution = [];
  let currentRow = 0;
  
  // Start with VVIP near the stage
  const reversedCategories = [...categories].reverse();
  
  for (const category of reversedCategories) {
    for (let i = 0; i < category.rowCount; i++) {
      if (currentRow < rows) {
        rowDistribution[currentRow] = category.name;
        currentRow++;
      }
    }
  }
  
  // Fill remaining rows with General if any
  while (currentRow < rows) {
    rowDistribution[currentRow] = 'General';
    currentRow++;
  }
  
  // Generate seats
  for (let row = 0; row < rows; row++) {
    const rowLabel = String.fromCharCode(65 + row);
    const category = categories.find(c => c.name === rowDistribution[row]);
    
    for (let col = 0; col < cols; col++) {
      const seatNumber = col + 1;
      const seatId = `${rowLabel}${seatNumber}`;
      const isUnavailable = unavailableSeats.includes(seatId);
      
      // Position calculation with aisle
      let x = col * (seatWidth + spacing);
      if (aisleAfterCol && col >= aisleAfterCol) {
        x += aisleWidth;
      }
      
      const y = (row * (seatHeight + spacing)) + stageHeight + 20;
      
      // Seat element with hover and click events
      svg += `<g class="seat-group" data-seat="${seatId}">
        <rect x="${x}" y="${y}" 
          width="${seatWidth}" height="${seatHeight}" 
          rx="3" fill="${isUnavailable ? '#f44336' : (category ? category.color : '#cccccc')}" 
          stroke="#333" stroke-width="1"
          class="seat ${isUnavailable ? 'unavailable' : 'available'}"
          data-category="${category ? category.name : 'General'}"
          data-row="${rowLabel}"
          data-col="${seatNumber}"
          onmouseover="showSeatInfo('${seatId}', '${category ? category.name : 'General'}')"
          onmouseout="hideSeatInfo()" />
        <text x="${x + seatWidth/2}" y="${y + seatHeight/2 + 5}" 
          text-anchor="middle" font-size="10" fill="#333" 
          dominant-baseline="middle">${seatNumber}</text>
      </g>`;
    }
  }
  
  // Add row labels
  for (let row = 0; row < rows; row++) {
    const rowLabel = String.fromCharCode(65 + row);
    const y = (row * (seatHeight + spacing)) + stageHeight + 20 + seatHeight/2 + 5;
    
    svg += `<text x="10" y="${y}" 
            text-anchor="end" font-size="10" fill="#333" 
            dominant-baseline="middle">${rowLabel}</text>`;
  }
  
  // Add aisle if specified
  if (aisleAfterCol) {
    const aisleX = aisleAfterCol * (seatWidth + spacing) + seatWidth/2;
    svg += `<path d="M${aisleX} ${stageHeight + 20} V${svgHeight - 10}" 
            stroke="#666" stroke-width="2" stroke-dasharray="5,5" />`;
    svg += `<text x="${aisleX + 10}" y="${stageHeight + 40}" 
            font-size="12" fill="#666">AISLE</text>`;
  }
  
  // Add seat info display area
  svg += `<rect id="seat-info-box" x="10" y="10" width="200" height="60" 
          fill="white" stroke="#333" rx="3" opacity="0" />
        <text id="seat-info-text" x="20" y="30" font-size="12" fill="#333" opacity="0">
          Seat: 
          <tspan id="seat-info-id" font-weight="bold"></tspan>
        </text>
        <text id="seat-info-category" x="20" y="50" font-size="12" fill="#333" opacity="0">
          Category: 
          <tspan id="seat-info-cat-name" font-weight="bold"></tspan>
        </text>`;
  
  // Add JavaScript for interactivity
  svg += `<script>
    function showSeatInfo(seatId, category) {
      const box = document.getElementById('seat-info-box');
      const text = document.getElementById('seat-info-text');
      const catText = document.getElementById('seat-info-category');
      const seatIdText = document.getElementById('seat-info-id');
      const catNameText = document.getElementById('seat-info-cat-name');
      
      seatIdText.textContent = seatId;
      catNameText.textContent = category;
      
      box.setAttribute('opacity', '0.9');
      text.setAttribute('opacity', '1');
      catText.setAttribute('opacity', '1');
    }
    
    function hideSeatInfo() {
      document.getElementById('seat-info-box').setAttribute('opacity', '0');
      document.getElementById('seat-info-text').setAttribute('opacity', '0');
      document.getElementById('seat-info-category').setAttribute('opacity', '0');
    }
  </script>`;
  
  svg += `</svg>`;
  return svg;
};

module.exports = venueController;