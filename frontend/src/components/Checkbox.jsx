import PropsType from 'prop-types'
import { twMerge } from 'tailwind-merge'

const Checkbox = ({ className = '', label = '', checked, onChange }) => {
	return (
		<div className={twMerge('checkbox-wrapper-46', className)}>
			<input
				className="inp-cbx"
				id="cbx-46"
				type="checkbox"
				checked={checked}
				onChange={onChange}
			/>
			<label className="cbx" htmlFor="cbx-46">
				<span>
					<svg width="10px" height="8px" viewBox="0 0 12 10">
						<polyline points="1.5 6 4.5 9 10.5 1"></polyline>
					</svg>
				</span>
				<span className="ml-1 text-sm">{label}</span>
			</label>
		</div>
	)
}

Checkbox.propTypes = {
	className: PropsType.string,
	label: PropsType.string,
	checked: PropsType.bool,
	onChange: PropsType.func,
}

export default Checkbox
