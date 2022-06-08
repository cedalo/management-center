# Management Center

The management center for Eclipse Mosquitto. See the [official documentation](https://docs.cedalo.com/) for additional details.


<br/>


## Run in development mode

Either go to [official documentation page](https://docs.cedalo.com/management-center/2.4/installation/) and follow steps there or clone this repository and then:


* Intstall `Docker` and `docker-compose`
* Intstall `yarn` package manager


* Run mosquitto queue:
    * Create `mosquitto` directory
    * Go inside this directory, create `config` and `data` directories
    * Go inside `config` directory and create config file `mosquitto.conf`
    * You can find an example of such file [here](https://github.com/eclipse/mosquitto/blob/master/mosquitto.conf). Be sure to uncomment or add the following lines to this file:
        ```
            listener 1883
            allow_anonymous true
        ```

    * Inside the `mosquitto` directory create a `docker-compose.yaml` file with the following content:

        ```
        version: '3.8'

        services:
            mosquitto:
                image: eclipse-mosquitto:2
                ports:
                    - 127.0.0.1:1883:1883
                    - 127.0.0.1:8080:8080
                    - 8883:8883
                volumes:
                    - ./mosquitto/config:/mosquitto/config
                    - ./mosquitto/data:/mosquitto/data
                networks:
                    - mosquitto
        networks:
            mosquitto:
                name: mosquitto
                driver: bridge
        ```

    * Inside `mosquitto` directory run the following command to start the queue:
        ```
            docker-compose up
        ```

* Now, when mosquitto queue is installed, go to the root directory of the Management Center and run:

    ```
        yarn install
    ```

* Go to the `/frontend` folder and run:
    ```
        yarn run build-without-base-path
    ```

* Set the following environmental variables (Note that `export` command works for Unix. For Windows use `set`):
    ```
        export CEDALO_MC_BROKER_ID="mosquitto" \
        export CEDALO_MC_BROKER_NAME="Mosquitto" \
        export CEDALO_MC_BROKER_URL="mqtt://localhost:1883" \
        export CEDALO_MC_BROKER_USERNAME="" \
        export CEDALO_MC_BROKER_PASSWORD="" \
        export CEDALO_MC_USERNAME="cedalo" \
        export CEDALO_MC_PASSWORD="tests" \
        export CEDALO_MC_PROXY_HOST="localhost" \
        export CEDALO_API_USERNAME="cedalo" \
        export CEDALO_API_PASSWORD="secret"
    ```

* Go to the `backend` directory and run:
    ```
        yarn start
    ```


* Go to `http://localhost:8088` to start working with the Manager
