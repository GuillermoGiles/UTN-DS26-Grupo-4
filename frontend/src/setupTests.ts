// Suma los matchers de DOM (toBeInTheDocument, toHaveTextContent, ...) al expect de Vitest
// y desmonta lo renderizado después de cada test.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
