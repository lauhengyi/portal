export interface Series {
  name: string;
  data: number[];
}

export default function getSeriesArray(
  frames: Record<number, Object[]>,
  tags: string[],
  confidence: number
): Series[] {
  // Initialize the series with arrays of 0s for each trame
  const seriesArray: Series[] = [];
  for (let i = 0; i < tags.length; i += 1) {
    const series = {
      name: tags[i],
      data: Array(Object.keys(frames).length).fill(0),
    };
    seriesArray.push(series);
  }

  let currentFrame = 0;
  for (const frame of Object.values(frames)) {
    // Count the amount of annotations for each tag in the frame
    for (const annotation of frame) {
      if (annotation.confidence > confidence) {
        seriesArray[annotation.tag.id].data[currentFrame]++;
      }
    }
    currentFrame++;
  }

  return seriesArray;
}
