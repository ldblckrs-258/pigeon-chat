import { twMerge } from 'tailwind-merge'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
const TextField = ({
	label = 'Label',
	value = '',
	onChange,
	className,
	readOnly = false,
	error = false,
	type = 'text',
	maxLength = 100,
	onEnter,
}) => {
	const [isFocus, setIsFocus] = useState(false)
	const inputRef = useRef(null)
	return (
		<div className={twMerge('relative', className)}>
			<motion.label
				className={twMerge(
					'absolute left-3 top-3 bg-white px-1.5 text-gray-500',
					isFocus || value != ''
						? 'select-none text-[13px] font-semibold'
						: 'cursor-text text-sm',
					isFocus && !readOnly ? 'text-cyan-500' : '',
					error && !readOnly ? 'text-red-500' : '',
				)}
				onClick={() => inputRef.current.focus()}
				animate={
					isFocus || value != '' ? { x: -4, y: -20 } : { x: 0, y: 0 }
				}
			>
				{label}
			</motion.label>
			<input
				ref={inputRef}
				value={value}
				onChange={readOnly ? () => {} : onChange}
				className={twMerge(
					'h-11 w-full rounded border border-gray-300 px-4 pt-1 focus:outline-none',
					error ? 'border-red-400' : 'focus:border-cyan-500',
					readOnly ? 'focus:border-gray-300' : '',
				)}
				placeholder=""
				readOnly={readOnly}
				onFocus={() => setIsFocus(true)}
				onBlur={() => setIsFocus(false)}
				type={type}
				maxLength={maxLength}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && onEnter) {
						onEnter()
					}
				}}
			/>
		</div>
	)
}

export default TextField
