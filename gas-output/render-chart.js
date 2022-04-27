const fs = require("fs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const width = 960; //px
const height = 540; //px
const canvasRenderService = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColor: "white",
});

module.exports = {
  render: async (config) => {
    const imageBuffer = await canvasRenderService.renderToBuffer(config);

    const title = config.options.plugins.title.text;
    // Write image to file
    fs.writeFileSync(
      __dirname +
        "\\plot\\" +
        title
          .toLowerCase()
          .replaceAll(" ", "-")
          .replaceAll(":", "")
          .replaceAll(",", "") +
        ".png",
      imageBuffer,
      { flag: "w" }
    );
  },

  configuration: (title, labels, datasets, extraOptions) => {
    return {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        layout: {
          padding: 20,
        },
        maxBarThickness: 150,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 20,
            },
          },
        },
        ...extraOptions,
      },
      plugins: [
        {
          id: "background-colour",
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          },
        },
      ],
    };
  },
};
