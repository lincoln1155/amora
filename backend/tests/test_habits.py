from datetime import date, timedelta
from app.routes.habits import calculate_streak

TODAY = date.today()
YESTERDAY = TODAY - timedelta(days=1)
TWO_DAYS_AGO = TODAY - timedelta(days=2)
THREE_DAYS_AGO = TODAY - timedelta(days=3)
LAST_WEEK = TODAY - timedelta(days=7)


def test_streak_is_zero_when_no_checkins():
    assert calculate_streak([]) == 0


def test_streak_is_zero_when_last_checkin_is_too_old():
    assert calculate_streak([LAST_WEEK]) == 0


def test_streak_is_one_when_only_today_is_checked():
    assert calculate_streak([TODAY]) == 1


def test_streak_counts_consecutive_days_ending_today():
    dates = [TODAY, YESTERDAY, TWO_DAYS_AGO]
    assert calculate_streak(dates) == 3


def test_streak_remains_active_when_last_checkin_was_yesterday():
    dates = [YESTERDAY, TWO_DAYS_AGO]
    assert calculate_streak(dates) == 2


def test_streak_breaks_at_first_gap():
    dates = [TODAY, YESTERDAY, THREE_DAYS_AGO]
    assert calculate_streak(dates) == 2
