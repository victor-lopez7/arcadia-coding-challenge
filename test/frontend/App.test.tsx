import { render } from '@testing-library/react';
import App from '../../frontend/src/App';

test('renders learn react link', () => {
  render(<App/>);
  const appRoot = document.querySelector('.App');
  expect(appRoot).toBeInTheDocument();
});
