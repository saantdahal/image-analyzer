import ComplaintTable from '../../components/common/ComplaintTable';
import { getUserComplaints } from '../../services/complaintService';

export default function MyComplaints() {
  return (
    <>
      <div className="mb-4">
        <h5 className="fw-semibold mb-0" style={{ color: 'var(--color-text-primary)' }}>
          My Complaints
        </h5>
        <small style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          All complaints you have submitted
        </small>
      </div>
      <ComplaintTable
        fetchFn={getUserComplaints}
        actionLabel="Track"
        actionPath="/complaints"
      />
    </>
  );
}