FROM python:3.8

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8111

CMD ["/bin/sh", "-c", "chmod 777 /tmp/log && python3 ./listener.py"]

