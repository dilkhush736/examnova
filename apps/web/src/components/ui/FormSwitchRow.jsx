export function FormSwitchRow({ label, description, checked, onChange, name }) {
  return (
    <label className="switch-row">
      <div>
        <strong>{label}</strong>
        <p className="support-copy">{description}</p>
      </div>
      <input checked={checked} name={name} onChange={onChange} type="checkbox" />
    </label>
  );
}
