type Props = {
  size?: number;
};

function PaymonIcon({ size = 24 }: Props) {
    return (
        <span className="icon-icon_logo text-xl" style={{ fontSize: `${size}px` }}></span>
    );
}

export default PaymonIcon;
