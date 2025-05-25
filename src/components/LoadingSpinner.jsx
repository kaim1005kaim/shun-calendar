/**
 * ローディングスピナーコンポーネント
 */

const LoadingSpinner = ({ message = "読み込み中..." }) => {
  return (
    <div className="app loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
