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
      
      if (!name || !rows || !cols) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Name, rows and cols are required fields'
        });
      }
      
      const parsedRows = parseInt(rows, 10);
      const parsedCols = parseInt(cols, 10);

      if (categories) {
        const totalCategoryRows = categories.reduce((sum, cat) => sum + (parseInt(cat.rowCount, 10) || 0), 0);
        if (totalCategoryRows > parsedRows) {
          return res.status(400).json({ 
            status: 'error',
            message: 'Total category rows exceed venue rows'
          });
        }
      }
      
      const unavailableSeats = req.body.unavailableSeats || []; 
      const totalSeats = parsedRows * parsedCols; 
      
      const venueData = {
        name,
        description,
        layoutType,
        totalSeats,
        seatMap: {
          rows: parsedRows,
          cols: parsedCols,
          aisleAfterCol: aisleAfterCol ? parseInt(aisleAfterCol, 10) : undefined,
          categories: categories || [],
          unavailableSeats
        }
      };
      
      venueData.svgTemplate = generateSVG({
        rows: venueData.seatMap.rows,
        cols: venueData.seatMap.cols,
        aisleAfterCol: venueData.seatMap.aisleAfterCol,
        categories: venueData.seatMap.categories,
        unavailableSeats: venueData.seatMap.unavailableSeats,
      });
      
      const venue = new Venue(venueData);
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

  // Get venue with pricing from event (for seat map display)
  getVenueWithPricing: async (req, res) => {
    try {
      const venue = await Venue.findById(req.params.venueId);
      if (!venue || !venue.seatMap) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Venue not found or has no seat map' 
        });
      }
      
      const event = await Event.findById(req.params.eventId); // No need to populate event.seats here explicitly
      if (!event) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Event not found' 
        });
      }
      
      const categoriesWithPricing = venue.seatMap.categories.map(cat => {
        const eventTicketType = event.ticketTypes.find(tt => tt.type === cat.name);
        return {
          ...cat.toObject(), 
          price: eventTicketType ? eventTicketType.price : 0 
        };
      });
      
      const bookedSeatIds = event.seats.filter(s => s.isBooked).map(s => s.id);

      const eventSpecificSvg = generateSVG({
        rows: venue.seatMap.rows,
        cols: venue.seatMap.cols,
        aisleAfterCol: venue.seatMap.aisleAfterCol,
        categories: categoriesWithPricing, 
        unavailableSeats: venue.seatMap.unavailableSeats || [], 
        eventBookedSeats: bookedSeatIds 
      });
      
      const responseData = {
        _id: venue._id,
        name: venue.name,
        description: venue.description,
        layoutType: venue.layoutType,
        totalSeats: venue.totalSeats, 
        seatMap: { 
          rows: venue.seatMap.rows,
          cols: venue.seatMap.cols,
          aisleAfterCol: venue.seatMap.aisleAfterCol,
          categories: categoriesWithPricing, 
          unavailableSeats: venue.seatMap.unavailableSeats || []
        },
        svgTemplate: eventSpecificSvg, 
        createdAt: venue.createdAt,
        updatedAt: venue.updatedAt,
      };
      
      res.status(200).json({
        status: 'success',
        data: responseData
      });
    } catch (err) {
      console.error('Error fetching venue with pricing:', err);
      
      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid ID format for venue or event'
        });
      }
      
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to fetch venue with pricing details',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Update venue
  updateVenue: async (req, res) => {
    try {
      const { name, description, layoutType, rows, cols, aisleAfterCol, categories, unavailableSeats } = req.body;
      
      const venue = await Venue.findById(req.params.id);
      if (!venue) {
        return res.status(404).json({ 
          status: 'error',
          message: 'Venue not found' 
        });
      }
      
      let layoutChanged = false;
      if (name) venue.name = name;
      if (description) venue.description = description;
      if (layoutType) venue.layoutType = layoutType;

      const parsedRows = rows ? parseInt(rows, 10) : venue.seatMap.rows;
      const parsedCols = cols ? parseInt(cols, 10) : venue.seatMap.cols;
      const parsedAisleAfterCol = aisleAfterCol ? parseInt(aisleAfterCol, 10) : venue.seatMap.aisleAfterCol;

      if (rows && venue.seatMap.rows !== parsedRows) { venue.seatMap.rows = parsedRows; layoutChanged = true; }
      if (cols && venue.seatMap.cols !== parsedCols) { venue.seatMap.cols = parsedCols; layoutChanged = true; }
      if (aisleAfterCol && venue.seatMap.aisleAfterCol !== parsedAisleAfterCol) { venue.seatMap.aisleAfterCol = parsedAisleAfterCol; layoutChanged = true; }
      
      if (categories) { 
        venue.seatMap.categories = categories.map(cat => ({
            ...cat,
            rowCount: parseInt(cat.rowCount, 10) || 0
        }));
        layoutChanged = true; 
      }
      if (unavailableSeats) { venue.seatMap.unavailableSeats = unavailableSeats; layoutChanged = true; }


      if (layoutChanged) {
         if (venue.seatMap.categories) { 
            const totalCategoryRows = venue.seatMap.categories.reduce((sum, cat) => sum + (cat.rowCount || 0), 0);
            if (totalCategoryRows > venue.seatMap.rows) {
              return res.status(400).json({ 
                status: 'error',
                message: 'Total category rows exceed venue rows'
              });
            }
          }
        venue.totalSeats = venue.seatMap.rows * venue.seatMap.cols;
        venue.svgTemplate = generateSVG({ 
          rows: venue.seatMap.rows,
          cols: venue.seatMap.cols,
          aisleAfterCol: venue.seatMap.aisleAfterCol,
          categories: venue.seatMap.categories,
          unavailableSeats: venue.seatMap.unavailableSeats || []
        });
      }
      
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
  },

  // For admin panel preview when defining a venue
  generateSVGPreview: async (req, res) => {
    try {
      const { rows, cols, aisleAfterCol, categories, unavailableSeats = [] } = req.body;
  
      if (!rows || !cols || !categories) {
        return res.status(400).json({ error: 'Missing required parameters for SVG preview' });
      }
  
      const svg = generateSVG({
        rows: parseInt(rows, 10),
        cols: parseInt(cols, 10),
        aisleAfterCol: aisleAfterCol ? parseInt(aisleAfterCol, 10) : undefined,
        categories: categories.map(cat => ({...cat, rowCount: parseInt(cat.rowCount, 10) || 0})),
        unavailableSeats,
      });
      
      res.json({ svg }); 
      
    } catch (error) {
      console.error('Error generating SVG preview:', error);
      res.status(500).json({ error: 'Failed to generate SVG preview' });
    }
  },
};

// Helper function to generate SVG
function generateSVG({ rows, cols, aisleAfterCol, categories, unavailableSeats = [], eventBookedSeats = [] }) {
  const seatWidth = 30;
  const seatHeight = 30;
  const spacing = 5; 
  const aisleTrueWidth = 40; 
  const stageHeight = 40;
  const stagePadding = 10; 
  const rowLabelWidth = 20; // Space for row labels (A, B, C...)
  const topOffset = stageHeight + stagePadding + 20; 

  let effectiveAisleWidth = 0;
  if (aisleAfterCol && cols > aisleAfterCol) {
      effectiveAisleWidth = aisleTrueWidth - spacing; 
  }
  const baseSeatLayoutWidth = (cols * (seatWidth + spacing)) - spacing + effectiveAisleWidth;
  const svgWidth = baseSeatLayoutWidth + rowLabelWidth;
  const svgHeight = topOffset + (rows * (seatHeight + spacing)) - spacing;

  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
  
  // Adjust stage position to account for row labels
  const stageRectWidth = baseSeatLayoutWidth; 
  svg += `<rect x="${rowLabelWidth + (baseSeatLayoutWidth - stageRectWidth) / 2}" y="${stagePadding}" width="${stageRectWidth}" height="${stageHeight}" fill="#333" rx="3" />`;
  svg += `<text x="${rowLabelWidth + baseSeatLayoutWidth / 2}" y="${stagePadding + stageHeight / 2}" text-anchor="middle" fill="white" font-size="14" font-weight="bold" dominant-baseline="middle">STAGE</text>`;
  
  let rowDistribution = [];
  let currentDistributedRow = 0;
  const safeCategories = Array.isArray(categories) ? categories : [];
  const reversedCategories = [...safeCategories].reverse(); 
  
  for (const category of reversedCategories) {
    const catRowCount = parseInt(category.rowCount, 10) || 0;
    for (let i = 0; i < catRowCount && currentDistributedRow < rows; i++) {
      rowDistribution[currentDistributedRow] = category.name;
      currentDistributedRow++;
    }
  }
  while (currentDistributedRow < rows) {
    const generalCat = safeCategories.find(c => c.name && c.name.toLowerCase() === 'general');
    rowDistribution[currentDistributedRow] = generalCat ? generalCat.name : 'Unknown'; 
    currentDistributedRow++;
  }
  
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r); 
    const categoryForThisRowName = rowDistribution[r];
    const categoryForThisRow = safeCategories.find(c => c.name === categoryForThisRowName);
    
    // Add row label text element
    const rowLabelY = topOffset + r * (seatHeight + spacing) + seatHeight / 2;
    svg += `<text x="${rowLabelWidth / 2}" y="${rowLabelY}" text-anchor="middle" font-size="12" fill="#333" dominant-baseline="middle">${rowLabel}</text>`;

    for (let c = 0; c < cols; c++) {
      const seatNumber = c + 1; 
      const seatId = `${rowLabel}${seatNumber}`;
      
      const isStaticallyUnavailable = unavailableSeats.includes(seatId);
      const isEventBooked = eventBookedSeats.includes(seatId);
      const isActuallyUnavailable = isStaticallyUnavailable || isEventBooked;
      
      // Adjust seat x-coordinate for row labels
      let x = rowLabelWidth + c * (seatWidth + spacing);
      if (aisleAfterCol && c >= aisleAfterCol) { 
        x += effectiveAisleWidth;
      }
      const y = topOffset + r * (seatHeight + spacing);
      
      const seatFillColor = isActuallyUnavailable 
        ? '#757575' 
        : (categoryForThisRow ? categoryForThisRow.color : '#cccccc'); 
      
      svg += `<g class="seat-group" data-seat="${seatId}">
        <rect x="${x}" y="${y}" width="${seatWidth}" height="${seatHeight}" rx="3" 
          fill="${seatFillColor}" stroke="#333" stroke-width="1"
          class="seat ${isActuallyUnavailable ? 'unavailable' : 'available'}"
          data-category="${categoryForThisRow ? categoryForThisRow.name : 'Unknown'}"
          data-row="${rowLabel}" data-col="${seatNumber}" />
        <text x="${x + seatWidth / 2}" y="${y + seatHeight / 2 + 1}" 
          text-anchor="middle" font-size="10" fill="${isActuallyUnavailable ? '#fff' : '#333'}" 
          dominant-baseline="middle">${seatNumber}</text>
      </g>`;
    }
  }
  
  svg += `<script>
    function showSeatInfo(seatId, category) { /* For potential future use or admin preview */ }
    function hideSeatInfo() { /* For potential future use or admin preview */ }
  </script>`;
  
  svg += `</svg>`;
  return svg;
};

module.exports = venueController;