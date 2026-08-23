#!/bin/bash
set -e
cd "$(dirname "$0")/backend"
export SURF_DEV_AUTH_BYPASS="false"
export SURF_DEV_FIXED_PHONE_LOGIN="true"
export SURF_DEV_PHONE="${SURF_DEV_PHONE:-19155147738}"
export SURF_MOCK_SMS_CODE="${SURF_MOCK_SMS_CODE:-123456}"
python3 -m pip install -r requirements.txt -q
python3 main.py
