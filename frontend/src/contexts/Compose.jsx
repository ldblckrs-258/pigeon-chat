import PropsType from 'prop-types'

export default function Compose(props) {
	const { components = [], children } = props
	return (
		<>
			{components.reduceRight(
				(acc, Comp) => (
					<Comp>{acc}</Comp>
				),
				children,
			)}
		</>
	)
}

Compose.propTypes = {
	components: PropsType.arrayOf(PropsType.elementType),
	children: PropsType.node,
}
