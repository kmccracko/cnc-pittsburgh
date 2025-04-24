import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistogramGraphProps {
  histogram: { [key: number]: number };
  width?: number;
  height?: number;
}

interface DataPoint {
  week: number;
  count: number;
}

const HistogramGraph: React.FC<HistogramGraphProps> = ({ 
  histogram, 
  width = 200, 
  height = 100 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Get the actual container width if available
    const containerWidth = containerRef.current ? containerRef.current.clientWidth : width;
    const actualWidth = Math.min(containerWidth, width);

    // Define margins
    const margin = { top: 10, right: 0, bottom: 20, left: 10 };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG with margins
    const svg = d3.select(svgRef.current)
      .attr('width', actualWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales with padding
    const xScale = d3.scaleLinear()
      .domain([0, 52]) // 53 weeks (0-52)
      .range([0, innerWidth]);

    // Add month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Map weeks to months (approximate)
    const monthPositions = monthNames.map((_, i) => {
      // Approximate week position for each month (4.33 weeks per month)
      return i * 4.33;
    });
    
    // Add vertical grid lines for each month (draw these first so they appear behind other elements)
    monthPositions.forEach(pos => {
      // Create a group for each grid line
      const gridGroup = svg.append('g');
      
      // Add multiple lines with decreasing opacity to create a fade effect
      for (let i = 0; i < 10; i++) {
        const opacity = 0.1 + (i * 0.09); // Opacity from 0.1 to 1.0
        const yStart = (innerHeight / 10) * i;
        const yEnd = (innerHeight / 10) * (i + 1);
        
        gridGroup.append('line')
          .attr('x1', xScale(pos))
          .attr('y1', yStart)
          .attr('x2', xScale(pos))
          .attr('y2', yEnd)
          .attr('stroke', '#aaa')
          .attr('stroke-width', 0.5)
          .attr('opacity', opacity);
      }
    });

    // Add x-axis with month labels
    const xAxis = svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('color', '#aaa')
      .attr('font-size', '10px');
    
    // Add the x-axis line
    xAxis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', innerWidth)
      .attr('y2', 0)
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1);
    
    // Add tick marks for each month
    // monthPositions.forEach(pos => {
    //   xAxis.append('line')
    //     .attr('x1', xScale(pos))
    //     .attr('y1', 0)
    //     .attr('x2', xScale(pos))
    //     .attr('y2', 5)
    //     .attr('stroke', '#aaa')
    //     .attr('stroke-width', 1);
    // });
    
    // Add month labels
    monthPositions.forEach((pos, i) => {
      xAxis.append('text')
        .attr('x', xScale(Math.max(0, pos))+12) // Add 12 to center the text between the grid lines that represent the month starts
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#aaa')
        .text(monthNames[i]);
    });

    // If we have histogram data, render it
    if (Object.keys(histogram).length > 0) {
      // Convert histogram object to array of data points
      const data: DataPoint[] = Object.entries(histogram).map(([week, count]) => ({
        week: parseInt(week),
        count: count
      }));

      // Sort data by week
      data.sort((a, b) => a.week - b.week);

      // Set up y-scale based on data
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d: DataPoint) => d.count) || 0])
        .range([innerHeight, 0]);

      // Create line generator
      const line = d3.line<DataPoint>()
        .x((d: DataPoint) => xScale(d.week))
        .y((d: DataPoint) => yScale(d.count))
        .curve(d3.curveMonotoneX);

      // Add the line path
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'rgb(240, 229, 108)') // Using the project's yellow color
        .attr('stroke-width', 2)
        .attr('d', line);

      // Calculate current position in the year as a percentage (0-1)
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      
      // Calculate percentage through the year
      const yearProgress = (now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime());
      
      // Convert percentage to x-axis position (0-52 weeks)
      const yearPosition = yearProgress * 52;
      
      // Find the two data points to interpolate between
      const week1 = Math.floor(yearPosition);
      const week2 = Math.min(week1 + 1, 52);
      
      // Get the data points for these weeks
      const point1 = data.find(d => d.week === week1) || { week: week1, count: 0 };
      const point2 = data.find(d => d.week === week2) || { week: week2, count: 0 };
      
      // Calculate the exact position between the two weeks
      const weekFraction = yearPosition - week1;
      
      // Interpolate the count value
      const exactCount = point1.count + (point2.count - point1.count) * weekFraction;
      
      // Add the "you are here" point last so it appears on top of everything
      svg.append('circle')
        .attr('class', 'current-position')
        .attr('cx', xScale(yearPosition))
        .attr('cy', yScale(exactCount))
        .attr('r', 3)
        .attr('fill', '#fff')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    } else {
      // If no data, add a placeholder message
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#aaa')
        .attr('font-size', '12px')
        .text('Loading data...');
    }
  }, [histogram, width, height]);

  return (
    <div className="histogram-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default HistogramGraph; 