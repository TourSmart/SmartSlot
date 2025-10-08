const shapes = [
  { id: 'shape-1', className: 'floating-shape floating-shape--one' },
  { id: 'shape-2', className: 'floating-shape floating-shape--two' },
  { id: 'shape-3', className: 'floating-shape floating-shape--three' },
  { id: 'shape-4', className: 'floating-shape floating-shape--four' },
];

const DecorativeBackground = () => (
  <div className="app__background" aria-hidden="true">
    {shapes.map((shape) => (
      <span key={shape.id} className={shape.className} />
    ))}
    <div className="app__light app__light--one" />
    <div className="app__light app__light--two" />
    <div className="app__light app__light--three" />
  </div>
);

export default DecorativeBackground;
