import myIcon from './s.svg';

// const XSvg = (props) => (
// 	<svg aria-hidden='true' viewBox='0 0 64 64' {...props}>
// 		<path d="M32 4C15.536 4 4 15.536 4 32s11.536 28 28 28 28-11.536 28-28S48.464 4 32 4zm0 6c12.144 0 22 9.856 22 22s-9.856 22-22 22-22-9.856-22-22S19.856 10 32 10zm-6 16c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 4c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4zm6 0c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" />
// 	</svg>
// );
const XSvg = (props) => (
	<img src={myIcon} alt="My Icon" {...props} />
);

export default XSvg;
