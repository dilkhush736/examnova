export function LoadingCard({ message = "Loading..." }) {
  return (
    <div className="route-loader">
      <div className="loading-pulse" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
