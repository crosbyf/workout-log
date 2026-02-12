import { useUIStore } from '../../stores/uiStore';
import StatsMenu from '../stats/StatsMenu';
import ExerciseList from '../stats/ExerciseList';
import ExerciseDetail from '../stats/ExerciseDetail';
import WeightTracker from '../stats/WeightTracker';
import ProteinTracker from '../stats/ProteinTracker';

export default function StatsScreen() {
  const { statsView, selectedExercise } = useUIStore();

  if (statsView === 'menu') {
    return <StatsMenu />;
  }

  if (statsView === 'exercises') {
    if (selectedExercise) {
      return <ExerciseDetail />;
    }
    return <ExerciseList />;
  }

  if (statsView === 'weight') {
    return <WeightTracker />;
  }

  if (statsView === 'protein') {
    return <ProteinTracker />;
  }

  return <StatsMenu />;
}
