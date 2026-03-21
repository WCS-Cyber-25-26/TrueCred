"use client";

import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

export default function BlockchainGraph({ universities }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const nodes = useMemo(() => {
    const hub = {
      id: "truecred-hub",
      label: "TrueCred",
      type: "hub",
      credentials: null,
      chainEnabled: true,
      revoked: false,
    };

    const uniNodes = universities.map((u) => ({
      id: String(u.id),
      label: u.name.length > 18 ? u.name.slice(0, 16) + "…" : u.name,
      type: "university",
      credentials: u.stats?.totalCredentials ?? u._count?.credentials ?? 0,
      onChain: u.stats?.onChainCredentials ?? 0,
      chainEnabled: u.chainEnabled,
      revoked: !!u.revocation,
    }));

    return [hub, ...uniNodes];
  }, [universities]);

  const links = useMemo(() =>
    universities.map((u) => ({
      source: "truecred-hub",
      target: String(u.id),
      chainEnabled: u.chainEnabled,
    })),
    [universities]
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = 480;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const defs = svg.append("defs");

    // Hub glow filter
    const hubGlow = defs.append("filter").attr("id", "hub-glow");
    hubGlow.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "coloredBlur");
    const hubMerge = hubGlow.append("feMerge");
    hubMerge.append("feMergeNode").attr("in", "coloredBlur");
    hubMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // University on-chain glow filter
    const uniGlow = defs.append("filter").attr("id", "uni-glow");
    uniGlow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const uniMerge = uniGlow.append("feMerge");
    uniMerge.append("feMergeNode").attr("in", "coloredBlur");
    uniMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Gradients
    const hubGrad = defs.append("radialGradient").attr("id", "hub-grad");
    hubGrad.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    hubGrad.append("stop").attr("offset", "100%").attr("stop-color", "#1d4ed8");

    const onChainGrad = defs.append("radialGradient").attr("id", "onchain-grad");
    onChainGrad.append("stop").attr("offset", "0%").attr("stop-color", "#1e40af");
    onChainGrad.append("stop").attr("offset", "100%").attr("stop-color", "#0d1f3c");

    const offChainGrad = defs.append("radialGradient").attr("id", "offchain-grad");
    offChainGrad.append("stop").attr("offset", "0%").attr("stop-color", "#1e293b");
    offChainGrad.append("stop").attr("offset", "100%").attr("stop-color", "#0a1628");

    const revokedGrad = defs.append("radialGradient").attr("id", "revoked-grad");
    revokedGrad.append("stop").attr("offset", "0%").attr("stop-color", "#3f0f0f");
    revokedGrad.append("stop").attr("offset", "100%").attr("stop-color", "#0a0808");

    // Dot grid pattern
    const pattern = defs.append("pattern")
      .attr("id", "dot-grid")
      .attr("width", 28)
      .attr("height", 28)
      .attr("patternUnits", "userSpaceOnUse");
    pattern.append("circle")
      .attr("cx", 1).attr("cy", 1).attr("r", 1)
      .attr("fill", "rgba(37,99,235,0.12)");

    // Background
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "#020817").attr("rx", 12);
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "url(#dot-grid)").attr("rx", 12);

    // Clone for simulation
    const simNodes = nodes.map((n) => ({ ...n }));
    const simLinks = links.map((l) => ({ ...l }));

    // Run simulation — pre-tick for initial layout, then keep live for drag
    const simulation = d3
      .forceSimulation(simNodes)
      .force("link", d3.forceLink(simLinks).id((d) => d.id).distance(140).strength(0.8))
      .force("charge", d3.forceManyBody().strength(-320))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(52))
      .stop();

    // Pre-tick to get a stable initial layout
    for (let i = 0; i < 300; i++) simulation.tick();

    // Hub appears first; university nodes stagger after it
    const NODE_DELAY = (d, i) => i === 0 ? 0 : 120 + (i - 1) * 90;
    const LINK_DELAY = (_, i) => 300 + i * 70;

    // Links — glow layer (start invisible, fade in after nodes)
    const linkGroup = svg.append("g");

    const linkGlow = linkGroup.selectAll("line.link-glow")
      .data(simLinks)
      .enter().append("line")
      .attr("class", "link-glow")
      .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y)
      .attr("stroke", (d) => d.chainEnabled ? "rgba(59,130,246,0.15)" : "transparent")
      .attr("stroke-width", 6)
      .attr("opacity", 0)
      .each(function (d, i) {
        d3.select(this).transition().delay(LINK_DELAY(d, i)).duration(400).attr("opacity", 1);
      });

    // Links — main
    const linkMain = linkGroup.selectAll("line.link-main")
      .data(simLinks)
      .enter().append("line")
      .attr("class", "link-main")
      .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y)
      .attr("stroke", (d) => d.chainEnabled ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)")
      .attr("stroke-width", (d) => d.chainEnabled ? 1.5 : 1)
      .attr("stroke-dasharray", (d) => d.chainEnabled ? "none" : "4 4")
      .attr("opacity", 0)
      .each(function (d, i) {
        d3.select(this).transition().delay(LINK_DELAY(d, i)).duration(400).attr("opacity", 1);
      });

    // Links — animated dash for on-chain
    const linkAnimated = linkGroup.selectAll("line.link-animated")
      .data(simLinks.filter((l) => l.chainEnabled))
      .enter().append("line")
      .attr("class", "link-animated")
      .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y)
      .attr("stroke", "rgba(96,165,250,0.7)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "6 20")
      .attr("stroke-dashoffset", 0)
      .attr("opacity", 0)
      .each(function (d, i) {
        const el = d3.select(this);
        el.transition().delay(LINK_DELAY(d, i)).duration(400).attr("opacity", 1)
          .on("end", function () {
            function animate() {
              el.attr("stroke-dashoffset", 0)
                .transition().duration(2000).ease(d3.easeLinear)
                .attr("stroke-dashoffset", -26)
                .on("end", animate);
            }
            animate();
          });
      });

    // Nodes
    const nodeGroup = svg.append("g");

    const nodeEnter = nodeGroup
      .selectAll("g.node")
      .data(simNodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y}) scale(0)`)
      .style("cursor", "grab");

    // Staggered pop-in: scale 0 → 1 with a slight overshoot
    nodeEnter.each(function (d, i) {
      d3.select(this)
        .transition()
        .delay(NODE_DELAY(d, i))
        .duration(420)
        .ease(d3.easeBackOut.overshoot(1.4))
        .attr("transform", `translate(${d.x},${d.y}) scale(1)`);
    });

    // Outer dashed ring (hub only)
    nodeEnter.filter((d) => d.type === "hub")
      .append("circle")
      .attr("r", 38)
      .attr("fill", "none")
      .attr("stroke", "rgba(59,130,246,0.25)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 5");

    // Pulse ring (hub only)
    nodeEnter.filter((d) => d.type === "hub")
      .append("circle")
      .attr("r", 32)
      .attr("fill", "none")
      .attr("stroke", "rgba(59,130,246,0.4)")
      .attr("stroke-width", 1)
      .each(function () {
        const el = d3.select(this);
        function pulse() {
          el.attr("r", 32).attr("opacity", 0.6)
            .transition().duration(1800).ease(d3.easeSinOut)
            .attr("r", 44).attr("opacity", 0)
            .on("end", pulse);
        }
        pulse();
      });

    // Main circle
    nodeEnter.append("circle")
      .attr("r", (d) => d.type === "hub" ? 28 : 22)
      .attr("fill", (d) => {
        if (d.type === "hub") return "url(#hub-grad)";
        if (d.revoked) return "url(#revoked-grad)";
        if (d.chainEnabled) return "url(#onchain-grad)";
        return "url(#offchain-grad)";
      })
      .attr("stroke", (d) => {
        if (d.type === "hub") return "rgba(96,165,250,0.8)";
        if (d.revoked) return "rgba(239,68,68,0.5)";
        if (d.chainEnabled) return "rgba(59,130,246,0.6)";
        return "rgba(255,255,255,0.1)";
      })
      .attr("stroke-width", (d) => d.type === "hub" ? 1.5 : 1)
      .attr("filter", (d) =>
        d.type === "hub" ? "url(#hub-glow)" : d.chainEnabled ? "url(#uni-glow)" : "none"
      );

    // Hub label — "TC"
    nodeEnter.filter((d) => d.type === "hub")
      .append("text")
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("dy", "-4").attr("font-size", "11px").attr("font-weight", "700")
      .attr("fill", "white").attr("font-family", "'Syne', sans-serif")
      .text("TC");

    nodeEnter.filter((d) => d.type === "hub")
      .append("text")
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("dy", "8").attr("font-size", "7px").attr("font-weight", "500")
      .attr("fill", "rgba(255,255,255,0.6)").attr("font-family", "'DM Sans', sans-serif")
      .text("HUB");

    // University — credential count
    nodeEnter.filter((d) => d.type === "university")
      .append("text")
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("dy", "-3").attr("font-size", "11px").attr("font-weight", "700")
      .attr("fill", (d) => {
        if (d.revoked) return "rgba(239,68,68,0.7)";
        if (d.chainEnabled) return "#93c5fd";
        return "rgba(255,255,255,0.4)";
      })
      .attr("font-family", "'Syne', sans-serif")
      .text((d) => d.credentials ?? "–");

    nodeEnter.filter((d) => d.type === "university")
      .append("text")
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("dy", "8").attr("font-size", "6px")
      .attr("fill", "rgba(255,255,255,0.3)").attr("font-family", "'DM Sans', sans-serif")
      .text("creds");

    // University — name label below node
    nodeEnter.filter((d) => d.type === "university")
      .append("text")
      .attr("text-anchor", "middle").attr("y", 34)
      .attr("font-size", "9px").attr("font-weight", "500")
      .attr("fill", (d) => {
        if (d.revoked) return "rgba(239,68,68,0.6)";
        if (d.chainEnabled) return "rgba(147,197,253,0.8)";
        return "rgba(255,255,255,0.35)";
      })
      .attr("font-family", "'DM Sans', sans-serif")
      .text((d) => d.label);

    // Hub — "TrueCred" label below
    nodeEnter.filter((d) => d.type === "hub")
      .append("text")
      .attr("text-anchor", "middle").attr("y", 40)
      .attr("font-size", "9px").attr("font-weight", "600")
      .attr("fill", "rgba(96,165,250,0.8)").attr("font-family", "'DM Sans', sans-serif")
      .text("TrueCred");

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("background", "#0d1f3c")
      .style("border", "1px solid rgba(37,99,235,0.35)")
      .style("border-radius", "10px")
      .style("padding", "10px 14px")
      .style("font-family", "'DM Sans', sans-serif")
      .style("font-size", "12px")
      .style("color", "white")
      .style("z-index", "100")
      .style("min-width", "160px")
      .style("transition", "opacity 0.15s ease");

    nodeEnter
      .on("mouseenter", function (event, d) {
        if (d.type === "hub") return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const scaleX = svgRect.width / width;
        const scaleY = svgRect.height / height;

        tooltip
          .style("opacity", "1")
          .style("left", `${d.x * scaleX + 30}px`)
          .style("top", `${d.y * scaleY - 20}px`)
          .html(`
            <div style="font-weight:600;color:white;margin-bottom:6px">${d.label}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;display:flex;flex-direction:column;gap:3px">
              <span>Total credentials: <span style="color:#93c5fd;font-weight:600">${d.credentials}</span></span>
              <span>On-chain: <span style="color:${d.chainEnabled ? '#4ade80' : 'rgba(255,255,255,0.3)'};font-weight:600">${d.chainEnabled ? 'Yes' : 'No'}</span></span>
              <span>Status: <span style="color:${d.revoked ? '#f87171' : '#4ade80'};font-weight:600">${d.revoked ? 'Revoked' : 'Active'}</span></span>
            </div>
          `);

        d3.select(this).select("circle")
          .transition().duration(150)
          .attr("r", d.type === "hub" ? 30 : 25);
      })
      .on("mouseleave", function (event, d) {
        tooltip.style("opacity", "0");
        d3.select(this).select("circle")
          .transition().duration(150)
          .attr("r", d.type === "hub" ? 28 : 22);
      });

    // ── Tick handler — updates link and node positions on each simulation step ──
    function ticked() {
      linkGlow
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);

      linkMain
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);

      linkAnimated
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);

      nodeEnter.attr("transform", (d) => `translate(${d.x},${d.y}) scale(1)`);
    }

    // ── Drag behavior ──
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.closest("g.node")).style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
        // Update tooltip position if visible
        if (d.type !== "hub") {
          const svgRect = svgRef.current.getBoundingClientRect();
          const scaleX = svgRect.width / width;
          const scaleY = svgRect.height / height;
          tooltip
            .style("left", `${d.fx * scaleX + 30}px`)
            .style("top", `${d.fy * scaleY - 20}px`);
        }
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        // Release the node so it can drift back naturally
        d.fx = null;
        d.fy = null;
        d3.select(event.sourceEvent.target.closest("g.node")).style("cursor", "grab");
      });

    nodeEnter.call(drag);

    // Delay simulation restart until after the node intro animations finish
    const simTimer = setTimeout(() => {
      simulation.on("tick", ticked).alphaTarget(0).restart();
    }, 300 + simNodes.length * 90 + 450);

    return () => {
      clearTimeout(simTimer);
      simulation.stop();
      tooltip.remove();
    };
  }, [nodes, links]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg ref={svgRef} style={{ display: "block", width: "100%", borderRadius: 12 }} />
    </div>
  );
}
