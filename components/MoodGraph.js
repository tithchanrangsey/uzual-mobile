import React from 'react';
import { Dimensions } from 'react-native';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';
import dayjs from 'dayjs';
import { Body } from './styled';
import { Svg } from 'expo';
const {
  Defs,
  Stop,
  LinearGradient,
  Path,
  G,
  Line,
  Circle,
  Text,
  Symbol,
  Use
} = Svg;

import { start, end, days, daysInMonth } from '../utils/dayjs';
import {
  faDizzy,
  faFrown,
  faFrownOpen,
  faMeh,
  faSmile,
  faLaugh,
  faGrinHearts
} from '@fortawesome/free-solid-svg-icons';
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//dizzy, frown, frown-open, meh,smile, laught, grid-hearts
const icns = [
  'Dizzy',
  'Frown',
  'FrownOpen',
  'Meh',
  'Smile',
  'Laugh',
  'GrinHearts'
];
const icons = {
  Dizzy: faDizzy,
  Frown: faFrown,
  FrownOpen: faFrownOpen,
  Meh: faMeh,
  Smile: faSmile,
  Laugh: faLaugh,
  GrinHearts: faGrinHearts
};

const createMoodData = (data = realData) =>
  days.map(({ date: day }, i) => {
    // console.log(d.findIndex(a => a.startsWith(totalDays[i])) === i)
    const index = data.findIndex(a => a.date.startsWith(day));
    const item = index !== -1 ? data[index] : null;
    return {
      x: item ? icns.indexOf(item.type) : 0,
      y: i + 1,
      mood: item ? icons[item.type] : icons['Dizzy'],
      time: item ? dayjs(item.date) : null
    };
  });

const daySpacer = 40;
const height = screenHeight * 0.8;
const ITEMS_PER_ROW = icns.length;
const cellSize = height / daysInMonth;
const width = ITEMS_PER_ROW * cellSize + daySpacer;
const xRange = icns.length * cellSize + cellSize / 2;

const xScale = d3Scale
  .scaleLinear()
  .domain([0, icns.length])
  .range([cellSize / 2, xRange]);

const yScale = d3Scale
  .scaleTime()
  .domain([start, end])
  .range([cellSize * 1.4, height + cellSize * 1.4]);

var line = d3Shape
  .line()
  .defined(function(d) {
    return d.time !== null;
  })
  .x(function(d, i) {
    return xScale(d.x);
  }) // set the x values for the line generator
  .y(function(d, i) {
    return yScale(d.time);
    // return i * cellSize;
  }); // set the y values for the line generator

export default ({ moods }) => {
  const moodData = createMoodData(moods);
  // TODO: Add a prettier UI!
  if (!moodData.length === 0) {
    return <Body>There's nothing to display.</Body>;
  }

  return (
    <Svg
      height={height}
      width={width}
      viewBox={`-${daySpacer} 0 ${width} ${height + cellSize}`}
    >
      <Defs>
        <LinearGradient
          id='moodGradient'
          x1={`-${daySpacer}`}
          y1='0'
          x2={`${width - daySpacer}`}
          y2='0'
        >
          <Stop offset='0%' stopColor='red' />
          <Stop offset='100%' stopColor='green' />
        </LinearGradient>
      </Defs>
      {icns.map((n, index) => {
        const icon = icons[n];
        const [w, h, _, __, path] = icon.icon;
        return [
          <Symbol
            viewBox={`0 0 ${w} ${h}`}
            id={`symbol_${icon.iconName}`}
            key={`symbol-${icon.iconName}`}
          >
            <Path
              d={path}
              fill='none'
              stroke='#333'
              strokeWidth='24'
              fill='#00000010'
            />
          </Symbol>,
          // 0.35 => cellSize / 2 (0.5) - 0.7/2
          // subtract the cellSize / 2 to align it to the middle
          // subtract half of the actual size
          // (cellSize * .7) / 2 => cellSize * .3 or 30% :p
          <Use
            key={`heading-${icon.iconName}`}
            x={xScale(index) - cellSize * 0.35}
            href={`#symbol_${icon.iconName}`}
            width={cellSize * 0.7}
            height={cellSize * 0.7}
          />
        ];
      })}
      {moodData.map((mood, index) => {
        const { iconName, time, x, y } = mood;
        return (
          <G key={time || index}>
            <Text
              fontFamily='Menlo'
              textAnchor='end'
              x={-cellSize / 2}
              y={xScale(y) + 2}
              fontSize={cellSize / 2.5}
              fill='#00000040'
              fontWeight='bolder'
            >
              {`${DAYS[index % 7]} ${index + 1}`}
            </Text>
            {time && (
              <>
                <Circle
                  cx={xScale(x)}
                  cy={xScale(y)}
                  r={cellSize / 7}
                  fill='#333333'
                />
                <Circle
                  cx={xScale(x)}
                  cy={xScale(y)}
                  r={cellSize / 3}
                  fill='#33333310'
                />
              </>
            )}
            <Line
              x1={0}
              y1={xScale(index + 1)}
              x2={width}
              y2={xScale(index + 1)}
              key={iconName}
              stroke='#55555510'
              strokeWidth='1'
              strokeDasharray={'5, 5'}
            />
          </G>
        );
      })}
      <Path
        d={line(moodData)}
        fill='none'
        stroke='url(#moodGradient)'
        strokeWidth='1'
      />
      {icns.map((icon, index) => {
        return (
          <Line
            key={`${icon.iconName}-${index}`}
            x1={xScale(index)}
            y1={cellSize}
            x2={xScale(index)}
            y2={height}
            stroke='#55555510'
            strokeWidth='1'
            strokeDasharray={'5, 5'}
          />
        );
      })}
    </Svg>
  );
};
