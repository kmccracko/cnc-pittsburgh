import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistogramGraphProps {
  histogram: { [key: number]: number };
  width?: number;
  height?: number;
}

interface DataPoint {
  month: number;
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
    if (!svgRef.current || Object.keys(histogram).length === 0) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Get the actual container width if available
    const containerWidth = containerRef.current ? containerRef.current.clientWidth : width;
    const actualWidth = Math.min(containerWidth, width);

    // Define margins
    const margin = { top: 10, right: 20, bottom: 30, left: 10 };
    const innerWidth = actualWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Convert histogram object to array of data points
    const data: DataPoint[] = Object.entries(histogram).map(([month, count]) => ({
      month: parseInt(month),
      count: count
    }));

    // Sort data by month
    data.sort((a, b) => a.month - b.month);

    // Create SVG with margins
    const svg = d3.select(svgRef.current)
      .attr('width', actualWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales with padding
    const xScale = d3.scaleLinear()
      .domain([0.5, 12]) // Add padding to domain
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: DataPoint) => d.count) || 0])
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3.line<DataPoint>()
      .x((d: DataPoint) => xScale(d.month))
      .y((d: DataPoint) => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#E6D600') // Using the project's yellow color
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots for each month
    svg.selectAll('circle.month-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'month-point')
      .attr('cx', (d: DataPoint) => xScale(d.month))
      .attr('cy', (d: DataPoint) => yScale(d.count))
      .attr('r', 3)
      .attr('fill', '#E6D600');

    // Calculate current position in the year (0-1)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate(); // 1-31
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgress = currentDay / daysInMonth; // 0-1
    const yearPosition = (currentMonth - 1 + monthProgress) / 12; // 0-1

    // Find the two months to interpolate between
    const month1 = Math.floor(yearPosition * 12) + 1;
    const month2 = month1 === 12 ? 1 : month1 + 1;
    
    // Get the data points for these months
    const point1 = data.find(d => d.month === month1) || { month: month1, count: 0 };
    const point2 = data.find(d => d.month === month2) || { month: month2, count: 0 };
    
    // Calculate the exact position between the two months
    const monthFraction = (yearPosition * 12) % 1;
    const exactMonth = month1 + monthFraction;
    
    // Interpolate the count value
    const exactCount = point1.count + (point2.count - point1.count) * monthFraction;
    
    // Add the "you are here" point
    svg.append('circle')
      .attr('class', 'current-position')
      .attr('cx', xScale(exactMonth))
      .attr('cy', yScale(exactCount))
      .attr('r', 6)
      .attr('fill', '#00f')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Add x-axis with month labels
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(12)
        .tickFormat((d) => monthNames[Math.floor(d as number) - 1])
      )
      .attr('color', '#ccc')
      .attr('font-size', '10px');

  }, [histogram, width, height]);

  return (
    <div className="histogram-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default HistogramGraph; 