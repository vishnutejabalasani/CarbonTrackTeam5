export default function Placeholder({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="text-gray-500 text-sm mt-2">
        This screen hasn't been designed yet — coming in a later milestone.
      </p>
    </div>
  );
}
