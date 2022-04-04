FROM python:3.11.0a6-alpine3.15

ENV CRON_EXPRESSION "* * * * *"

RUN echo 'http://dl-cdn.alpineLinux.org/alpine/edge/community' >> /etc/apk/repositories && \
apk update && apk add firefox-esr

RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk && \
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-bin-2.30-r0.apk && \
apk add glibc-2.30-r0.apk && \
apk add glibc-bin-2.30-r0.apk && \
wget https://github.com/mozilla/geckodriver/releases/download/v0.30.0/geckodriver-v0.30.0-linux64.tar.gz && \
tar -zxf geckodriver-v0.30.0-linux64.tar.gz -C /usr/bin

RUN apk update && apk add python3 && \
python3 -m pip install --upgrade pip setuptools wheel && \
apk add --no-cache --virtual .pynacl-deps build-base python3-dev libffi-dev && \
pip3 install -U selenium

RUN echo "$CRON_EXPRESSION" /usr/local/bin/python3 /pythonScript/script.py ">>" /pythonScript/output.txt >> crontab.txt

RUN crontab crontab.txt

RUN crond

CMD /bin/sh
