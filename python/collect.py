"""Collect reproducible market snapshots. Run from the repository root.

Python owns the data collection so the pipeline is easy to inspect. The web
engine applies the same calculations to saved data and live refreshes.
"""
import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import requests

PORTFOLIO = [
    ('RELIANCE', 'Reliance Industries', 'Energy'),
    ('TCS', 'Tata Consultancy Services', 'Technology'),
    ('INFY', 'Infosys', 'Technology'),
    ('HCLTECH', 'HCL Technologies', 'Technology'),
    ('HDFCBANK', 'HDFC Bank', 'Banking'),
    ('ICICIBANK', 'ICICI Bank', 'Banking'),
    ('BHARTIARTL', 'Bharti Airtel', 'Telecom'),
    ('ITC', 'ITC', 'Consumer'),
    ('SUNPHARMA', 'Sun Pharmaceutical', 'Healthcare'),
    ('LT', 'Larsen & Toubro', 'Industrials'),
    ('M&M', 'Mahindra & Mahindra', 'Automotive'),
    ('TITAN', 'Titan Company', 'Consumer'),
    ('DIXON', 'Dixon Technologies', 'Electronics'),
    ('CDSL', 'Central Depository Services', 'Market infrastructure'),
    ('KPITTECH', 'KPIT Technologies', 'Technology'),
    ('POLYCAB', 'Polycab India', 'Industrials'),
    ('AARTIIND', 'Aarti Industries', 'Chemicals'),
    ('KARURVYSYA', 'Karur Vysya Bank', 'Banking'),
]
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}


def get(url, **kwargs):
    response = requests.get(url, timeout=(8, 25), headers=HEADERS, **kwargs)
    response.raise_for_status()
    return response.json()


def quote(company):
    symbol, name, sector = company
    result = {'symbol': symbol, 'name': name, 'sector': sector}
    try:
        data = get(f'https://query1.finance.yahoo.com/v8/finance/chart/{requests.utils.quote(symbol)}.NS', params={'range': '3mo', 'interval': '1d'})
        result['chart'] = data['chart']['result'][0]
    except Exception as exc:
        result['error'] = f'Price history unavailable ({type(exc).__name__}).'
    return result


def announcements(company):
    symbol = company[0]
    try:
        data = get('https://www.nseindia.com/api/corporate-announcements', params={'index': 'equities', 'symbol': symbol})
        return {'symbol': symbol, 'records': [r for r in data if r.get('symbol') == symbol][:80]}
    except Exception as exc:
        return {'symbol': symbol, 'records': [], 'error': type(exc).__name__}


def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        companies = list(pool.map(quote, PORTFOLIO))
        filings = list(pool.map(announcements, PORTFOLIO))
    output = {'collectedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'portfolio': companies, 'filings': filings}
    target = Path(__file__).resolve().parents[1] / 'data' / 'raw-market.json'
    target.write_text(json.dumps(output, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'prices': sum('chart' in c for c in companies), 'companies': len(companies), 'filings': sum(len(f['records']) for f in filings), 'announcement_failures': [f['symbol'] for f in filings if f.get('error')]}))


if __name__ == '__main__':
    main()
