import ComplaintTable from '../../components/common/ComplaintTable';
import { getAdminComplaints } from '../../services/complaintService';

export default function ComplaintManagement() {
  return (
    <>
      <div className="mb-4">
        <h5 className="fw-semibold mb-0" style={{ color: 'var(--color-text-primary)' }}>
          Complaint Management
        </h5>
        <small style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          All complaints submitted to the system
        </small>
      </div>
      <ComplaintTable
        fetchFn={getAdminComplaints}
        actionLabel="Review"
        actionPath="/admin/complaints"
      />
    </>
  );
}