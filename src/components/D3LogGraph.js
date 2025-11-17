// src/components/D3LogGraph.js
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function D3LogGraph({ values = [] }) {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        if (!svg.node()) return;

        const width = svg.node().clientWidth || 500;
        const height = svg.node().clientHeight || 180;

        svg.selectAll("*").remove(); // clear previous frame
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        const margin = { top: 10, right: 10, bottom: 16, left: 10 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Normalise data
        const safeValues = values.length ? values : [0];
        const maxVal = d3.max(safeValues) || 1;

        const x = d3
            .scaleBand()
            .domain(safeValues.map((_, i) => i))
            .range([0, innerW])
            .padding(0.15);

        const y = d3
            .scaleLinear()
            .domain([0, maxVal])
            .range([innerH, 0]);

        // ==== Gradient + glow for bars ====
        const defs = svg.append("defs");

        const gradient = defs
            .append("linearGradient")
            .attr("id", "barsGradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#020617");
        gradient
            .append("stop")
            .attr("offset", "40%")
            .attr("stop-color", "#3b82f6");
        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#a855f7");

        // Slight blur for glow
        const glowFilter = defs
            .append("filter")
            .attr("id", "barsGlow");
        glowFilter
            .append("feGaussianBlur")
            .attr("stdDeviation", 3)
            .attr("result", "coloredBlur");
        const feMerge = glowFilter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // ==== Bars (equaliser look) ====
        g.selectAll("rect")
            .data(safeValues)
            .join(enter =>
                enter
                    .append("rect")
                    .attr("x", (_, i) => x(i))
                    .attr("width", x.bandwidth())
                    .attr("y", innerH)
                    .attr("height", 0)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("fill", "url(#barsGradient)")
                    .attr("filter", "url(#barsGlow)")
                    .transition()
                    .duration(200)
                    .attr("y", d => y(d))
                    .attr("height", d => innerH - y(d))
            )
            .transition()
            .duration(200)
            .attr("x", (_, i) => x(i))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d))
            .attr("height", d => innerH - y(d));

        // ==== Smooth line over the tops of the bars ====
        const line = d3
            .line()
            .x((d, i) => x(i) + x.bandwidth() / 2)
            .y(d => y(d))
            .curve(d3.curveCatmullRom.alpha(0.6));

        g.append("path")
            .datum(safeValues)
            .attr("fill", "none")
            .attr("stroke", "#38bdf8")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.9)
            .attr("d", line);

        // Faint baseline
        g.append("line")
            .attr("x1", 0)
            .attr("x2", innerW)
            .attr("y1", innerH)
            .attr("y2", innerH)
            .attr("stroke", "rgba(148,163,184,0.35)")
            .attr("stroke-width", 0.5);
    }, [values]);

    return <svg ref={svgRef} className="d3-visualiser-svg" />;
}
