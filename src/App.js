import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const workoutData = {
  'Lower Body Strength + Core': [
    { name: 'Back Squat', sets: 4, targetReps: '6-8' },
    { name: 'Romanian Deadlift', sets: 4, targetReps: '8-10' },
    { name: 'Bulgarian Split Squat', sets: 3, targetReps: '10-12' },
    { name: 'Plank', sets: 3, targetReps: '30-45s' },
    { name: 'Russian Twists', sets: 3, targetReps: '20' },
  ],
  'Upper Body Strength + Cardio': [
    { name: 'Bench Press', sets: 4, targetReps: '6-8' },
    { name: 'Bent-over Rows', sets: 4, targetReps: '8-10' },
    { name: 'Overhead Press', sets: 3, targetReps: '8-10' },
    { name: 'Jump Rope', sets: 1, targetReps: '15min HIIT' },
  ],
  'Lower Body Power + Core': [
    { name: 'Box Jumps', sets: 4, targetReps: '5' },
    { name: 'Speed Squats', sets: 4, targetReps: '5' },
    { name: 'Kettlebell Swings', sets: 4, targetReps: '12-15' },
    { name: 'Hanging Leg Raises', sets: 3, targetReps: '10-12' },
    { name: 'Side Planks', sets: 3, targetReps: '30s each' },
  ],
  'Upper Body Hypertrophy + Cardio': [
    { name: 'Incline Dumbbell Press', sets: 4, targetReps: '10-12' },
    { name: 'Pull-ups or Lat Pulldowns', sets: 4, targetReps: '8-10' },
    { name: 'Dips', sets: 3, targetReps: '10-12' },
    { name: 'Rowing', sets: 1, targetReps: '20min steady' },
  ],
};

const WorkoutTracker = () => {
  const [selectedWorkout, setSelectedWorkout] = useState('Lower Body Strength + Core');
  const [week, setWeek] = useState(1);
  const [exerciseData, setExerciseData] = useState({});

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('workoutData');
      if (storedData) {
        setExerciseData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('workoutData', JSON.stringify(exerciseData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [exerciseData]);

  const handleInputChange = (exercise, setNumber, field, value) => {
    setExerciseData(prevData => ({
      ...prevData,
      [selectedWorkout]: {
        ...prevData[selectedWorkout],
        [exercise]: {
          ...(prevData[selectedWorkout]?.[exercise] || {}),
          [week]: {
            ...(prevData[selectedWorkout]?.[exercise]?.[week] || {}),
            [setNumber]: {
              ...(prevData[selectedWorkout]?.[exercise]?.[week]?.[setNumber] || {}),
              [field]: value
            }
          }
        }
      }
    }));
  };

  const getChartData = (exercise) => {
    const data = [];
    for (let i = 1; i <= 8; i++) {
      const weekData = exerciseData[selectedWorkout]?.[exercise]?.[i];
      if (weekData) {
        const totalWeight = Object.values(weekData).reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0);
        const totalReps = Object.values(weekData).reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
        data.push({
          week: i,
          avgWeight: totalWeight / Object.keys(weekData).length,
          totalVolume: totalWeight * totalReps
        });
      } else {
        data.push({ week: i, avgWeight: 0, totalVolume: 0 });
      }
    }
    return data;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">8-Week Workout Tracker</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Workout:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedWorkout}
          onChange={(e) => setSelectedWorkout(e.target.value)}
        >
          {Object.keys(workoutData).map((workout) => (
            <option key={workout} value={workout}>{workout}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Select Week:</label>
        <select
          className="w-full p-2 border rounded"
          value={week}
          onChange={(e) => setWeek(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Enter Your Performance:</h2>
        {workoutData[selectedWorkout].map((exercise) => (
          <div key={exercise.name} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-medium mb-2">{exercise.name} (Target: {exercise.targetReps})</h3>
            {[...Array(exercise.sets)].map((_, setIndex) => (
              <div key={setIndex} className="flex mb-2">
                <div className="mr-2">
                  <label className="block">Set {setIndex + 1} Weight (lbs):</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={exerciseData[selectedWorkout]?.[exercise.name]?.[week]?.[setIndex + 1]?.weight || ''}
                    onChange={(e) => handleInputChange(exercise.name, setIndex + 1, 'weight', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block">Set {setIndex + 1} Reps:</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={exerciseData[selectedWorkout]?.[exercise.name]?.[week]?.[setIndex + 1]?.reps || ''}
                    onChange={(e) => handleInputChange(exercise.name, setIndex + 1, 'reps', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Progress Charts:</h2>
        {workoutData[selectedWorkout].map((exercise) => (
          <div key={exercise.name} className="mb-4">
            <h3 className="text-lg font-medium mb-2">{exercise.name}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getChartData(exercise.name)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgWeight" stroke="#8884d8" name="Avg Weight (lbs)" />
                <Line yAxisId="right" type="monotone" dataKey="totalVolume" stroke="#82ca9d" name="Total Volume (lbs)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutTracker;

