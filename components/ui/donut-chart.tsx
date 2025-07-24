import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';

Chart.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  description?: string;
  height?: number;
  alignLeft?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  description,
  height = 60,
  alignLeft = false,
}) => {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map(
          (d, i) =>
            d.color ||
            [
              '#ff9999',
              '#66b3ff',
              '#99ff99',
              '#ffcc99',
              '#c2c2f0',
              '#ffb3e6',
              '#f7b267',
              '#a3c9a8',
              '#f48498',
              '#6a0572',
            ][i % 10]
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    cutout: '50%',
    rotation: -40 * (Math.PI / 180),
  };

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
      {title && <div className={`font-semibold text-lg mb-1 ${alignLeft ? 'text-left' : 'text-center'}`}>{title}</div>}
      {description && <div className={`text-gray-500 text-sm mb-2 ${alignLeft ? 'text-left' : 'text-center'}`}>{description}</div>}
      <div className={alignLeft ? 'flex flex-row items-center' : 'flex flex-col items-center'}>
        <div className={alignLeft ? 'flex-shrink-0' : ''} style={{ minWidth: alignLeft ? 120 : undefined }}>
          <Doughnut data={chartData} options={options} height={height} />
        </div>
        <div className={alignLeft ? 'ml-4' : ''}>
          <div className={`flex flex-wrap ${alignLeft ? 'justify-start' : 'justify-center'} gap-4 mt-4`}>
            {data.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center space-x-2"
                style={{
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                  borderRadius: 6,
                  padding: '2px 10px',
                }}
              >
                <span style={{ display: 'inline-block', width: 16, height: 16, backgroundColor: chartData.datasets[0].backgroundColor[i], borderRadius: 4 }}></span>
                <span className="text-sm text-gray-700">{d.name}:</span>
                <span
                  className="font-bold text-base"
                  style={{
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                    borderRadius: 4,
                    padding: '2px 8px',
                    display: 'inline-block',
                  }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 