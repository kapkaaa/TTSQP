import React from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const HintButton: React.FC<Props> = ({ onClick, disabled = false, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default HintButton;