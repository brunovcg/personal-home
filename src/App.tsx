import { Suspense } from 'react';
import { SalaryPage } from './pages/salary/Salary.page';

export function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <SalaryPage />
      </Suspense>
    </div>
  );
}
