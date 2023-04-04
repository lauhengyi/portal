import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { TagColours } from "@portal/constants/annotation";

interface AnalyticsBarProps {
  confidence: number;
  videoInferenceData: any;
  videoElement: HTMLVideoElement | undefined;
  tags: string[];
}

export default function AnalyticsBar(props: AnalyticsBarProps) {
  const { confidence, videoInferenceData, videoElement, tags } = props;

  // Building a series
  const currentSeries = useMemo(() => {
    // Initialize the series with arrays of 0s for each trame
    const series = {};
    for (const tag of tags) {
      series[tag] = [{}];
      series[tag][0].data = Array(
        Object.keys(videoInferenceData.frames).length
      ).fill(0);
    }

    let currentFrame = 0;
    for (const frame of Object.values(videoInferenceData.frames)) {
      // Count the amount of annotations for each tag in the frame
      for (const annotation of frame) {
        series[annotation.tag.name][0].data[currentFrame]++;
      }
      currentFrame++;
    }

    console.log(series);
    return series;
  }, [confidence]);

  const allOptions = {};
  for (let i = 0; i < tags.length; i++) {
    allOptions[tags[i]] = {
      title: {
        text: tags[i],
        align: "left",
        margin: 0,
        offsetY: 20,
      },
      chart: {
        id: tags[i],
        group: "tags",
        type: "line",
        foreColor: "#f5f8fa",
        parentHeightOffset: 0,
        toolbar: {
            offsetY: 20,
        }
      },
      colors: [TagColours[i]],
      tooltip: {
        fillSeriesColor: true,
        y: {
          formatter: val => {
            return Math.ceil(val);
          },
          format: "blue",
        },
      },
      yaxis: {
        tickAmount: 5,
        lines: {
            show: false,
        }
      },
      xaxis: {
      tickAmount: 10,
      },
    };
  }

  return (
    <div className="chart-container">
      {tags.map(tag => (
        <Chart
          options={allOptions[tag]}
          series={currentSeries[tag]}
          type={"line"}
          height={160}
        />
      ))}
    </div>
  );
}

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
