async function fetchData() {
  const data = await d3.csv("./dataset/videogames_wide.csv");

  // Convert numeric fields
  data.forEach((d) => {
    d.Year = d.Year !== "" && d.Year != null ? +d.Year : null;
    d.Global_Sales = d.Global_Sales !== "" && d.Global_Sales != null ? +d.Global_Sales : 0;
  });

  return data;
}

async function render(viewID, spec) {
  try {
    const result = await vegaEmbed(viewID, spec, { actions: false });
    result.view.run();
  } catch (e) {
    console.error("VegaEmbed error:", e);
    const el = document.querySelector(viewID);
    if (el) el.innerHTML = `<pre style="color:red;white-space:pre-wrap">${e.message}</pre>`;
  }
}

fetchData().then(async (data) => {

  // V1-Q1: Total Global Sales by Platform (bar)
  // tooltip + hover highlight
  const v1_q1 = vl
    .markBar({ cursor: "pointer" })
    .data(data)
    .encode(
      vl.y().fieldN("Platform").sort("-x").title("Platform"),
      vl.x().fieldQ("Global_Sales").aggregate("sum").title("Total Global Sales (millions)"),
      vl.tooltip([
        { field: "Platform", type: "nominal", title: "Platform" },
        { field: "Global_Sales", type: "quantitative", aggregate: "sum", title: "Total Global Sales (M)" },
      ])
    )
    .width("container")
    .height(400)
    .title("V1 (Q1) — Which platforms have the highest total global sales?")
    .toSpec();

  v1_q1.params = [
    {
      name: "hoverPlatform",
      select: { type: "point", fields: ["Platform"], on: "mouseover", clear: "mouseout" },
    },
  ];
  v1_q1.encoding.opacity = {
    condition: { param: "hoverPlatform", value: 1 },
    value: 0.6,
  };

  const platformTotals = d3.rollups(
    data,
    (v) => d3.sum(v, (d) => d.Global_Sales),
    (d) => d.Platform
  );
  platformTotals.sort((a, b) => b[1] - a[1]);

  const topPlatforms12 = platformTotals.slice(0, 12).map((d) => d[0]);
  const topData12 = data.filter((d) => topPlatforms12.includes(d.Platform));

  // V1-Q2: Heatmap Genre x Platform (Top 12)
  // tooltip + hover highlight by Genre
  const v1_q2 = vl
    .markRect({ stroke: "white", strokeWidth: 0.5 })
    .data(topData12)
    .encode(
      vl.x().fieldN("Platform").sort(topPlatforms12).title("Platform (Top 12)"),
      vl.y().fieldN("Genre").title("Genre"),
      vl.color().fieldQ("Global_Sales").aggregate("sum").title("Total Global Sales (M)"),
      vl.tooltip([
        { field: "Platform", type: "nominal", title: "Platform" },
        { field: "Genre", type: "nominal", title: "Genre" },
        { field: "Global_Sales", type: "quantitative", aggregate: "sum", title: "Total Global Sales (M)" },
      ])
    )
    .width("container")
    .height(420)
    .title("V1 (Q2) — For the top platforms, which genres contribute most to sales?")
    .toSpec();

  v1_q2.params = [
    {
      name: "hoverCell",
      select: { type: "point", fields: ["Genre","Platform"], on: "mouseover", clear: "mouseout" },
    },
  ];
  v1_q2.encoding.opacity = {
    condition: { param: "hoverCell", value: 1 },
    value: 0.45,
  };

  await render("#view", v1_q1);
  await render("#view2", v1_q2);

  // Visualization 2 
  // V2-Q1: How have total global sales changed over time?
  // V2-Q2: How do trends differ across top platforms over time?

  // V2-Q1: Total Global Sales over Time (line + hover point)

  const v2_q1 = vl
    .layer(
      vl
        .markLine()
        .encode(
          vl.x().fieldQ("Year").title("Year"),
          vl.y().fieldQ("Global_Sales").aggregate("sum").title("Total Global Sales (M)")
        ),
      vl
        .markPoint({ filled: true, size: 80 })
        .encode(
          vl.x().fieldQ("Year"),
          vl.y().fieldQ("Global_Sales").aggregate("sum"),
          vl.tooltip([
            { field: "Year", type: "quantitative", title: "Year" },
            { field: "Global_Sales", type: "quantitative", aggregate: "sum", title: "Total Global Sales (M)" },
          ])
        )
    )
    .data(data)
    .width("container")
    .height(360)
    .title("V2 (Q1) — How have total global sales changed over time?")
    .toSpec();

  v2_q1.transform = [{ filter: "datum.Year != null" }];
  

  // =========================
  // V2-Q2: Top 6 Platforms trends (multi-line + hover highlight)
  // =========================
  const topPlatforms6 = platformTotals.slice(0, 6).map((d) => d[0]);
  const topData6 = data.filter((d) => topPlatforms6.includes(d.Platform));

  const v2_q2 = vl
    .markLine({ strokeWidth: 2 })
    .data(topData6)
    .encode(
      vl.x().fieldQ("Year").title("Year"),
      vl.y().fieldQ("Global_Sales").aggregate("sum").title("Total Global Sales (M)"),
      vl.color().fieldN("Platform").title("Platform (Top 6)"),
      vl.tooltip([
        { field: "Platform", type: "nominal", title: "Platform" },
        { field: "Year", type: "quantitative", title: "Year" },
        { field: "Global_Sales", type: "quantitative", aggregate: "sum", title: "Total Global Sales (M)" },
      ])
    )
    .width("container")
    .height(420)
    .title("V2 (Q2) — How do trends differ across top platforms over time?")
    .toSpec();

  v2_q2.transform = [{ filter: "datum.Year != null" }];

  v2_q2.params = [
    {
      name: "hoverV2P2",
      select: { type: "point", fields: ["Platform"], on: "mouseover", clear: "mouseout" },
    },
  ];
  v2_q2.encoding.opacity = {
    condition: { param: "hoverV2P2", value: 1 },
    value: 0.25,
  };

  await render("#view3", v2_q1);
  await render("#view4", v2_q2);
});
