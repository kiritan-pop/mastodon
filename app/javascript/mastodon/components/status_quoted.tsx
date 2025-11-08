import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import type { Map as ImmutableMap } from 'immutable';

import ArticleIcon from '@/material-icons/400-24px/article.svg?react';
import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import { Icon } from 'mastodon/components/icon';
import { LearnMoreLink } from 'mastodon/components/learn_more_link';
import StatusContainer from 'mastodon/containers/status_container';
import { domain } from 'mastodon/initial_state';
import type { Account } from 'mastodon/models/account';
import type { Status } from 'mastodon/models/status';
import type { RootState } from 'mastodon/store';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

import QuoteIcon from '../../images/quote.svg?react';
import { fetchRelationships } from '../actions/accounts';
import { revealAccount } from '../actions/accounts_typed';
import { fetchStatus } from '../actions/statuses';
import { makeGetStatusWithExtraInfo } from '../selectors';
import { getAccountHidden } from '../selectors/accounts';

import { Button } from './button';

const MAX_QUOTE_POSTS_NESTING_LEVEL = 1;

const QuoteWrapper: React.FC<{
  isError?: boolean;
  children: React.ReactNode;
}> = ({ isError, children }) => (
  <div
    className={classNames('status__quote', {
      'status__quote--error': isError,
    })}
  >
    <Icon id='quote' icon={QuoteIcon} className='status__quote-icon' />
    {children}
  </div>
);

const NestedQuoteLink: React.FC<{ status: Status }> = ({ status }) => {
  const accountValue = status.get('account') as string | Account | undefined;
  const accountId =
    typeof accountValue === 'string' ? accountValue : accountValue?.id;

  const account = useAppSelector((state) =>
    accountId ? state.accounts.get(accountId) : undefined,
  );

  const displayNameHtml = account?.get('display_name_html');
  const acct = account?.get('acct');

  if (!displayNameHtml || !acct) {
    return null;
  }

  const quoteAuthorElement = (
    <span dangerouslySetInnerHTML={{ __html: displayNameHtml }} />
  );
  const quoteUrl = `/@${acct}/${status.get('id') as string}`;

  return (
    <Link to={quoteUrl} className='status__quote-author-button'>
      <FormattedMessage
        id='status.quote_post_author'
        defaultMessage='Post by {name}'
        values={{ name: quoteAuthorElement }}
      />
      <Icon id='chevron_right' icon={ChevronRightIcon} />
      <Icon id='article' icon={ArticleIcon} />
    </Link>
  );
};

type GetStatusSelector = (
  state: RootState,
  props: { id?: string | null; contextType?: string },
) => {
  status: Status | null;
  loadingState: 'not-found' | 'loading' | 'filtered' | 'complete';
};

type QuoteMap = ImmutableMap<'state' | 'quoted_status', string | null>;

const LimitedAccountHint: React.FC<{ accountId: string }> = ({ accountId }) => {
  const dispatch = useAppDispatch();
  const reveal = useCallback(() => {
    dispatch(revealAccount({ id: accountId }));
  }, [dispatch, accountId]);

  return (
    <>
      <FormattedMessage
        id='status.quote_error.limited_account_hint.title'
        defaultMessage='This account has been hidden by the moderators of {domain}.'
        values={{ domain }}
      />
      <button onClick={reveal} className='link-button'>
        <FormattedMessage
          id='status.quote_error.limited_account_hint.action'
          defaultMessage='Show anyway'
        />
      </button>
    </>
  );
};

const FilteredQuote: React.FC<{
  reveal: VoidFunction;
  quotedAccountId: string;
  quoteState: string;
}> = ({ reveal, quotedAccountId, quoteState }) => {
  const account = useAppSelector((state) =>
    quotedAccountId ? state.accounts.get(quotedAccountId) : undefined,
  );

  const quoteAuthorName = account?.get('acct');
  const quoteDomain = quoteAuthorName?.split('@')[1];

  let message: React.ReactNode = null;

  switch (quoteState) {
    case 'blocked_account':
      message = (
        <FormattedMessage
          id='status.quote_error.blocked_account_hint.title'
          defaultMessage="This post is hidden because you've blocked @{name}."
          values={{ name: quoteAuthorName }}
        />
      );
      break;
    case 'blocked_domain':
      message = (
        <FormattedMessage
          id='status.quote_error.blocked_domain_hint.title'
          defaultMessage="This post is hidden because you've blocked {domain}."
          values={{ domain: quoteDomain }}
        />
      );
      break;
    case 'muted_account':
      message = (
        <FormattedMessage
          id='status.quote_error.muted_account_hint.title'
          defaultMessage="This post is hidden because you've muted @{name}."
          values={{ name: quoteAuthorName }}
        />
      );
      break;
    default:
      break;
  }

  return (
    <>
      {message}
      <button onClick={reveal} className='link-button'>
        <FormattedMessage
          id='status.quote_error.limited_account_hint.action'
          defaultMessage='Show anyway'
        />
      </button>
    </>
  );
};

interface QuotedStatusProps {
  quote: QuoteMap;
  contextType?: string;
  parentQuotePostId?: string | null;
  variant?: 'full' | 'link';
  nestingLevel?: number;
  onQuoteCancel?: () => void;
}

export const QuotedStatus: React.FC<QuotedStatusProps> = ({
  quote,
  contextType,
  parentQuotePostId,
  nestingLevel = 1,
  variant = 'full',
  onQuoteCancel,
}) => {
  const dispatch = useAppDispatch();
  const quoteState = useAppSelector((state) =>
    parentQuotePostId
      ? state.statuses.getIn([parentQuotePostId, 'quote', 'state'])
      : quote.get('state'),
  );

  const quotedStatusId = quote.get('quoted_status');
  const getStatusSelector = useMemo(
    () => makeGetStatusWithExtraInfo() as GetStatusSelector,
    [],
  );
  const { status, loadingState } = useAppSelector((state) =>
    getStatusSelector(state, { id: quotedStatusId, contextType }),
  );

  const accountValue = status?.get('account') as string | Account | undefined;
  const accountId =
    typeof accountValue === 'string'
      ? accountValue
      : (accountValue?.id ?? null);

  const hiddenAccount = useAppSelector((state) =>
    accountId ? getAccountHidden(state, accountId) : false,
  );

  const shouldFetchQuote =
    !status?.get('isLoading') &&
    quoteState !== 'deleted' &&
    loadingState === 'not-found';
  const isLoaded = loadingState === 'complete';

  const isFetchingQuoteRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      isFetchingQuoteRef.current = false;
    }
  }, [isLoaded]);

  useEffect(() => {
    if (shouldFetchQuote && quotedStatusId && !isFetchingQuoteRef.current) {
      dispatch(
        fetchStatus(quotedStatusId, {
          parentQuotePostId,
          alsoFetchContext: false,
        }),
      );
      isFetchingQuoteRef.current = true;
    }
  }, [shouldFetchQuote, quotedStatusId, parentQuotePostId, dispatch]);

  useEffect(() => {
    if (accountId && hiddenAccount) {
      dispatch(fetchRelationships([accountId]));
    }
  }, [accountId, hiddenAccount, dispatch]);

  const isFilteredAndHidden = loadingState === 'filtered';

  let quoteError: React.ReactNode = null;

  if (isFilteredAndHidden) {
    quoteError = (
      <FormattedMessage
        id='status.quote_error.filtered'
        defaultMessage='Hidden due to one of your filters'
      />
    );
  } else if (quoteState === 'pending') {
    quoteError = (
      <>
        <FormattedMessage
          id='status.quote_error.pending_approval'
          defaultMessage='Post pending'
        />

        <LearnMoreLink>
          <p>
            <FormattedMessage
              id='status.quote_error.pending_approval_popout.body'
              defaultMessage="On Mastodon, you can control whether someone can quote you. This post is pending while we're getting the original author's approval."
            />
          </p>
        </LearnMoreLink>
      </>
    );
  } else if (quoteState === 'revoked') {
    quoteError = (
      <FormattedMessage
        id='status.quote_error.revoked'
        defaultMessage='Post removed by author'
      />
    );
  } else if (
    (quoteState === 'blocked_account' ||
      quoteState === 'blocked_domain' ||
      quoteState === 'muted_account') &&
    !revealed &&
    accountId
  ) {
    quoteError = (
      <FilteredQuote
        quoteState={quoteState}
        reveal={reveal}
        quotedAccountId={accountId}
      />
    );
  } else if (
    !status ||
    !quotedStatusId ||
    quoteState === 'deleted' ||
    quoteState === 'rejected' ||
    quoteState === 'unauthorized'
  ) {
    quoteError = (
      <FormattedMessage
        id='status.quote_error.not_available'
        defaultMessage='Post unavailable'
      />
    );
  } else if (hiddenAccount && accountId) {
    quoteError = <LimitedAccountHint accountId={accountId} />;
  }

  if (quoteError) {
    const hasRemoveButton = contextType === 'composer' && !!onQuoteCancel;

    return (
      <QuoteWrapper isError>
        <>
          {quoteError}
          {hasRemoveButton && (
            <Button compact plain onClick={onQuoteCancel}>
              <FormattedMessage
                id='status.remove_quote'
                defaultMessage='Remove'
              />
            </Button>
          )}
        </>
      </QuoteWrapper>
    );
  }

  if (variant === 'link' && status) {
    return (
      <QuoteWrapper>
        <NestedQuoteLink status={status} />
      </QuoteWrapper>
    );
  }

  const childQuote = status?.get('quote') as QuoteMap | undefined;
  const canRenderChildQuote =
    childQuote && nestingLevel <= MAX_QUOTE_POSTS_NESTING_LEVEL;

  return (
    <QuoteWrapper>
      {/* @ts-expect-error Status is not yet typed */}
      <StatusContainer
        isQuotedPost
        id={quotedStatusId}
        contextType={contextType}
        avatarSize={40}
        onQuoteCancel={onQuoteCancel}
      >
        {canRenderChildQuote && (
          <QuotedStatus
            quote={childQuote}
            parentQuotePostId={quotedStatusId}
            contextType={contextType}
            variant={
              nestingLevel === MAX_QUOTE_POSTS_NESTING_LEVEL ? 'link' : 'full'
            }
            nestingLevel={nestingLevel + 1}
          />
        )}
      </StatusContainer>
    </QuoteWrapper>
  );
};

interface StatusQuoteManagerProps {
  id: string;
  contextType?: string;
  [key: string]: unknown;
}

/**
 * This wrapper component takes a status ID and, if the associated status
 * is a quote post, it renders the quote into `StatusContainer` as a child.
 * It passes all other props through to `StatusContainer`.
 */

export const StatusQuoteManager = (props: StatusQuoteManagerProps) => {
  const status = useAppSelector((state) => {
    const status = state.statuses.get(props.id);
    const reblogId = status?.get('reblog') as string | undefined;
    return reblogId ? state.statuses.get(reblogId) : status;
  });
  const quote = status?.get('quote') as QuoteMap | undefined;

  if (quote) {
    return (
      <StatusContainer {...props}>
        <QuotedStatus
          quote={quote}
          parentQuotePostId={status?.get('id') as string}
          contextType={props.contextType}
        />
      </StatusContainer>
    );
  }

  return <StatusContainer {...props} />;
};
