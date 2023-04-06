import React from "react";
import Chart from "react-apexcharts";
import { TagColours } from "@portal/constants/annotation";
import { Series } from "./getSeriesArray";


interface AnalyticsBarProps {
  videoOverlay: L.VideoOverlay;
  seriesArray: Series[];
}


const AnalyticsBar = (props: AnalyticsBarProps) => {
  const {videoOverlay, seriesArray} = props;
  const videoElement = videoOverlay.getElement();

  const options = {
    title: {
      text: 'Annotations per frame',
      align: "left",
      margin: 0,
    },
    chart: {
      type: "line",
      foreColor: "#f5f8fa",
      parentHeightOffset: 0,
      toolbar: {
        offsetY: 20,
      },
      events: {
        click: (_, __, config) => {
          const clickedFrame = config.dataPointIndex;
          if (videoElement) {
            videoElement.currentTime = clickedFrame / videoInferenceData.fps;
          }
        },
      },
    },
    colors: TagColours,
    tooltip: {
      fillSeriesColor: true,
      y: {
        title: {},
        formatter: val => {
            if (!val) return null;
            return `${val} annotations`;
        },
      },
      x: {
        formatter: val => `Frame ${val}`,
      },
    },
    yaxis: {
      tickAmount: 5,
      lines: {
        show: false,
      },
    },
    xaxis: {
      tickAmount: 10,
    },
  };

  return (
    <div className="chart-container">
      <Chart
        options={options}
        series={seriesArray}
        type={"line"}
        height={450}
      />
    </div>
  );
};

export default React.memo(AnalyticsBar);
