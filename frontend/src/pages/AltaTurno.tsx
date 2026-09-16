import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Row, Col, Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { turnoSchema, type TurnoValidado } from '../validations/turnoSchema';
import { FiCalendar, FiClock, FiUser, FiTool, FiCheckCircle } from 'react-icons/fi';
import { usePost } from '../hooks/usePost';

export function AltaTurno() {
    const navigate = useNavigate();
    const { postData, loading, error } = usePost('/turnos');

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TurnoValidado>({
        resolver: zodResolver(turnoSchema),
        defaultValues: {
            fecha: '',
            hora: '',
            cliente: '',
            tipoServicio: ''
        }
    });

    const onSubmit = async (data: TurnoValidado) => {
        const resultado = await postData(data);
        if (resultado) {
            navigate('/');
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-md-center">
                <Col md={8} lg={6}>
                    <div className="saas-card-dark p-4 p-md-5">
                        <div className="text-center mb-5">
                            <h2 className="mb-2">Reservar Turno</h2>
                            <p className="text-muted">Agendá un nuevo ingreso para el lavadero o lubricentro</p>
                        </div>

                        {error && (
                            <Alert variant="danger" className="text-center">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="fecha">
                                        <Form.Label className="small fw-bold text-muted">FECHA</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="date" 
                                                isInvalid={!!errors.fecha}
                                                {...register("fecha")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiCalendar className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.fecha?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4" controlId="hora">
                                        <Form.Label className="small fw-bold text-muted">HORA</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="time" 
                                                isInvalid={!!errors.hora}
                                                {...register("hora")} 
                                                style={{ paddingLeft: '2.5rem' }}
                                            />
                                            <FiClock className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.hora?.message}
                                            </Form.Control.Feedback>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4" controlId="cliente">
                                <Form.Label className="small fw-bold text-muted">CLIENTE / PATENTE</Form.Label>
                                <div className="position-relative">
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Ej: Juan Pérez - AB123CD"
                                        isInvalid={!!errors.cliente}
                                        {...register("cliente")} 
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                    <FiUser className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.cliente?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-5" controlId="tipoServicio">
                                <Form.Label className="small fw-bold text-muted">SERVICIO SOLICITADO</Form.Label>
                                <div className="position-relative">
                                    <Form.Select 
                                        isInvalid={!!errors.tipoServicio}
                                        {...register("tipoServicio")}
                                        style={{ paddingLeft: '2.5rem' }}
                                    >
                                        <option value="">Seleccione una opción...</option>
                                        <option value="Lavado Básico">Lavado Básico</option>
                                        <option value="Lavado Premium">Lavado Completo Premium</option>
                                        <option value="Cambio de Aceite">Cambio de Aceite y Filtros</option>
                                        <option value="Alineación y Balanceo">Alineación y Balanceo</option>
                                    </Form.Select>
                                    <FiTool className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.tipoServicio?.message}
                                    </Form.Control.Feedback>
                                </div>
                            </Form.Group>

                            <button 
                                type="submit" 
                                className="w-100 btn-primary-custom d-flex justify-content-center align-items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Spinner animation="border" size="sm" /> Guardando...</>
                                ) : (
                                    <><FiCheckCircle size={20} /> Confirmar Turno</>
                                )}
                            </button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
