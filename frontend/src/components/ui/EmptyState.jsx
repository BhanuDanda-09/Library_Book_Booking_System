import "./EmptyState.css";

export default function EmptyState({ icon = "📭", title = "Nothing here", description = "", action, actionLabel }) {
  return (
    <div className="empty-state animate-fadeInUp">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && (
        <button className="empty-state-btn" onClick={action}>
          {actionLabel || "Go Back"}
        </button>
      )}
    </div>
  );
}
