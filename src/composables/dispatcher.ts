import { Status } from '@/typings/common';

export function getDispatcherStatusId(dispatcherStatus: number | undefined) {
  if (dispatcherStatus === undefined) return 'free';

  switch (dispatcherStatus) {
    case Status.ActiveDispatcher.AFK:
      return 'afk';

    case Status.ActiveDispatcher.NO_LIMIT:
      return 'no-limit';

    case Status.ActiveDispatcher.ENDING:
      return 'ending';

    case Status.ActiveDispatcher.INVALID:
      return 'invalid';

    case Status.ActiveDispatcher.NOT_LOGGED_IN:
      return 'not-signed';

    case Status.ActiveDispatcher.NO_SPACE:
      return 'no-space';

    case Status.ActiveDispatcher.UNAVAILABLE:
      return 'unavailable';

    case Status.ActiveDispatcher.UNKNOWN:
      return 'unknown';

    case Status.ActiveDispatcher.FREE:
      return 'free';
  }

  if (dispatcherStatus >= Date.now() + 25500000) return 'no-limit';

  return 'online-to';
}
