import { Button } from '../atoms/Button';
import { Modal, ModalTitle } from '../atoms/Modal';

interface EventModalProps {
  icon: string;
  title: string;
  html: string;
  accent?: string;
  okLabel?: string;
  onOk: () => void;
}

/** Generic "confirm every board event with OK" dialog (organism). */
export function EventModal({ icon, title, html, accent = '#f0b429', okLabel = 'OK', onOk }: EventModalProps) {
  return (
    <Modal className="event-modal" style={{ ['--ac' as string]: accent } as React.CSSProperties}>
      <div className="ev-icon">{icon}</div>
      <ModalTitle>
        <span className="ev-title">{title}</span>
      </ModalTitle>
      <div className="ev-text" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="ev-ok">
        <Button variant="gold" big onClick={onOk}>
          {okLabel}
        </Button>
      </div>
    </Modal>
  );
}
