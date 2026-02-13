import { useUIStore } from '../../stores/uiStore';
import StatsMenu from '../stats/StatsMenu';
import ExerciseList from '../stats/ExerciseList';
import ExerciseDetail from '../stats/ExerciseDetail';
import WeightTracker from '../stats/WeightTracker';
import ProteinTracker from '../stats/ProteinTracker';

export default function StatsScreen() {
  const { statsView, selectedExercise } = useUIStore();

  return (
    <div className="px-4 pt-4">
      {statsView === 'menu' && <StatsMenu />}
      {statsView === 'exercises' && (selectedExercise ? <ExerciseDetail /> : <ExerciseList />)}
      {statsView === 'weight' && <WeightTracker />}
      {statsView === 'protein' && <ProteinTracker />}
    </div>
  );
}
