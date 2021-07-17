import { render } from '@testing-library/react';
import App from '../../frontend/src/App';

describe('App', () => {
  test('renders app', () => {
    render(<App/>);
    const appRoot = document.querySelector('.App');
    expect(appRoot).toBeInTheDocument();
  });
})
