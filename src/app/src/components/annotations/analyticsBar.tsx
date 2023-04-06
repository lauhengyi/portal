import React, { useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { TagColours } from "@portal/constants/annotation";

interface AnalyticsBarProps {
  confidence: number;
  videoInferenceData: any;
  videoOverlay: L.VideoOverlay;
  tagsObject: Record<string, number>;
}

interface Series {
  name: string;
  data: number[];
}

const AnalyticsBar = (props: AnalyticsBarProps) => {
  const { confidence, videoInferenceData, videoOverlay, tagsObject } = props;
  const videoElement = videoOverlay.getElement();
  const tags = Object.keys(tagsObject);

  // Building a series
  // Initialize the series with arrays of 0s for each trame
  const seriesArray: Series[] = [];
  for (let i = 0; i < tags.length; i += 1) {
    const series = {
      name: tags[i],
      data: Array(Object.keys(videoInferenceData.frames).length).fill(0),
    };
    seriesArray.push(series);
  }

  let currentFrame = 0;
  for (const frame of Object.values(videoInferenceData.frames)) {
    // Count the amount of annotations for each tag in the frame
    for (const annotation of frame) {
      if (annotation.confidence > confidence) {
        seriesArray[annotation.tag.id].data[currentFrame]++;
      }
    }
    currentFrame++;
  }

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

//   .filter(
//     ([annotation, _]) =>
//       annotation.options.confidence > this.props.confidence &&
//       /* If no filters selected, should return true. This is to
//       guard against some returning false on empty arrays */
//       (this.props.filterArr.length === 0 ||
//         /* Check if tag is present in filter (CASE-INSENSITIVE) */
//         this.props.showSelected ===
//           this.props.filterArr.some(filter =>
//             this.tagNames[annotation.options.annotationTag]
//               .toLowerCase()
//               .includes(filter.toLowerCase())
//           ))
//   )

export default React.memo(AnalyticsBar);
