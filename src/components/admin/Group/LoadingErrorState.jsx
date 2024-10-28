// LoadingErrorState.js
import React from "react";

const LoadingErrorState = ({ loading, error }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <p>No groups found.</p>
    </div>
  );
};

export default LoadingErrorState;
