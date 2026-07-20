const Card = ({ className = "", hover = false, children, ...props }) => (
  <div className={`card ${hover ? "card-hover" : ""} ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
