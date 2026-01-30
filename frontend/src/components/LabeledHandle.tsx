import { Handle, type HandleProps } from '@xyflow/react';

/**
 * Handle mit Label – inspiriert von React Flow UI (Labeled Handle).
 * @see https://reactflow.dev/ui/components/labeled-handle
 */
export interface LabeledHandleProps extends HandleProps {
  handleClassName?: string;
}

export function LabeledHandle({
  handleClassName = '',
  ...handleProps
}: LabeledHandleProps) {
  const triangleVariant =
    handleProps.type === 'target' ? 'rf-handle-triangle--target' : 'rf-handle-triangle--source';

  return (
    <Handle
      className={`rf-handle-triangle ${triangleVariant} ${handleClassName}`}
      style={{ width: 14, height: 14, pointerEvents: 'all' }}
      {...handleProps}
    />
  );
}
