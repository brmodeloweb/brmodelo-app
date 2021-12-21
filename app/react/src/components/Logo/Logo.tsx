const Logo = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="42"
			height="42"
			viewBox="0 0 512 512"
		>
			<g fill="none" fillRule="evenodd">
				<path fill="#3D9970" d="M0 0h512v512H0z" />
				<g transform="translate(80 130)">
					<rect fill="#FFF" width="157" height="92" rx="3" />
					<path
						d="M277.722 74.59l70.557 48.979a3 3 0 01-.06 4.97l-70.558 46.45a3 3 0 01-3.3 0l-70.465-46.451a3 3 0 01-.06-4.968l70.463-48.98a3 3 0 013.423 0z"
						fill="#FFF"
					/>
					<rect fill="#FFF" y="160" width="157" height="92" rx="3" />
					<path
						stroke="#FFF"
						strokeWidth="10"
						strokeLinecap="square"
						d="M144 37l136 84M144 212l141-86"
					/>
				</g>
			</g>
		</svg>
	);
};

export default Logo;
