import { Card, GameSnapshot } from '@manaflow/types';

export function joinClassNames(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function getCardMetadata(entityId: string, snapshot: GameSnapshot): Card | undefined {
  const entity = snapshot.entities[entityId];
  return entity?.components.find((component) => component.componentType === 'CARD')?.metadata as Card | undefined;
}
